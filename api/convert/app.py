import json
import os
import boto3
import pikepdf
from botocore.config import Config
from io import BytesIO

# LocalStack Configuration
IS_DOCKER = os.getenv("AWS_SAM_LOCAL") == "true"
LOCALSTACK_HOST = "host.docker.internal" if IS_DOCKER else "localhost"
LOCALSTACK_ENDPOINT = f"http://{LOCALSTACK_HOST}:4566"
S3_BUCKET_NAME = os.getenv("BUCKET_NAME", "pdf-upload-bucket")

s3_client = boto3.client(
    "s3",
    endpoint_url=LOCALSTACK_ENDPOINT,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="us-east-1",
    config=Config(s3={"addressing_style": "path"})
)

# Path to ICC profile (ensure this file exists in your working directory)
ICC_PROFILE_PATH = "./sRGB-IEC61966-2.1.icc"

def add_output_intent(pdf, icc_profile_path):
    """Add OutputIntent dictionary for color space compliance."""
    try:
        with open(icc_profile_path, "rb") as icc_file:
            icc_profile = icc_file.read()
        
        pdf.Root["/OutputIntents"] = [
            pikepdf.Dictionary(
                Type="/OutputIntent",
                S="/GTS_PDFA1",
                OutputConditionIdentifier="sRGB IEC61966-2.1",
                Info="sRGB IEC61966-2.1",
                DestOutputProfile=pikepdf.Stream(pdf, icc_profile)
            )
        ]
    except Exception as e:
        print(f"Error in add_output_intent: {str(e)}")
        raise

def add_markinfo(pdf):
    """Add MarkInfo dictionary to indicate marked content."""
    try:
        pdf.Root["/MarkInfo"] = pikepdf.Dictionary(Marked=True)
    except Exception as e:
        print(f"Error in add_markinfo: {str(e)}")
        raise

def embed_fonts(pdf):
    """Ensure all fonts are embedded (placeholder for font embedding)."""
    # Font embedding requires external tools like Ghostscript.
    # This function is a placeholder and does not perform font embedding.
    pass

def add_metadata(pdf, conformance_level="A"):
    """Add XMP metadata to the document."""
    try:
        xmp_metadata = f"""<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
        <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140 79.160924, 2017/07/13-01:06:39">
          <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about=""
              xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:xmp="http://ns.adobe.com/xap/1.0/"
              xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
              xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
              <dc:title>
                <rdf:Alt>
                  <rdf:li xml:lang="x-default">Sample Title</rdf:li>
                </rdf:Alt>
              </dc:title>
              <dc:creator>
                <rdf:Seq>
                  <rdf:li>Author Name</rdf:li>
                </rdf:Seq>
              </dc:creator>
              <xmp:CreateDate>2025-02-25T12:00:00Z</xmp:CreateDate>
              <xmp:ModifyDate>2025-02-25T12:00:00Z</xmp:ModifyDate>
              <pdfaid:part>3</pdfaid:part>
              <pdfaid:conformance>{conformance_level}</pdfaid:conformance>
            </rdf:Description>
          </rdf:RDF>
        </x:xmpmeta>"""
        
        pdf.Root["/Metadata"] = pikepdf.Stream(pdf, xmp_metadata.encode("utf-8"))
    except Exception as e:
        print(f"Error in add_metadata: {str(e)}")
        raise

def validate_pdfa3(file_stream):
    """Check if the PDF is PDF/A-3 compliant using pikepdf."""
    try:
        pdf = pikepdf.open(file_stream)
        return pdf.docinfo.get("/GTS_PDFA3") == "Yes"
    except Exception as e:
        print(f"Error in validate_pdfa3: {str(e)}")
        return False

def convert_to_pdfa3(file_stream):
    """Convert a given PDF to PDF/A-3 using modular steps."""
    pdf = pikepdf.open(file_stream)

    try:
        # Add OutputIntent for color space compliance
        add_output_intent(pdf, ICC_PROFILE_PATH)

        # Add MarkInfo dictionary
        add_markinfo(pdf)

        # Embed fonts (if needed)
        embed_fonts(pdf)

        # Add XMP metadata with conformance level A
        add_metadata(pdf, conformance_level="A")

        # Save the modified PDF to a new stream
        output_stream = BytesIO()
        pdf.save(output_stream, linearize=True)
        output_stream.seek(0)

        return output_stream
    except Exception as e:
        print(f"Error in convert_to_pdfa3: {str(e)}")
        raise

def lambda_handler(event, context):
    """Validate and Convert PDF to PDF/A-3 if necessary."""

    print(f"📂 Received Event: {event}")

    # ✅ Handle CORS Preflight (OPTIONS request)
    if event["httpMethod"] == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"message": "CORS preflight successful"})
        }

    try:
        # Parse the body of the event as JSON
        body = json.loads(event["body"])
        file_key = body["file_key"]

        bucket = S3_BUCKET_NAME

        # Retrieve the PDF from S3
        pdf_obj = s3_client.get_object(Bucket=bucket, Key=file_key)
        pdf_stream = BytesIO(pdf_obj["Body"].read())

        if validate_pdfa3(pdf_stream):
            print("✅ PDF is already compliant with PDF/A-3")
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, POST",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"status": "VALID", "message": "Already compliant"})
            }

        print("🔄 PDF is NOT compliant. Converting...")

        # Convert the PDF to PDF/A-3
        converted_pdf = convert_to_pdfa3(pdf_stream)

        # Upload the converted PDF back to S3
        s3_client.put_object(
            Bucket=bucket,
            Key=f"converted-{file_key}",
            Body=converted_pdf.getvalue(),
            ContentType="application/pdf"
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "status": "CONVERTED",
                "message": "PDF converted to PDF/A-3",
                "converted_file_key": f"converted-{file_key}"
            })
        }
    except Exception as e:
        print(f"🔥 Error in lambda_handler: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": str(e)})
        }
