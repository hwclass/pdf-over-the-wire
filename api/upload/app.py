import json
import os
import boto3
from botocore.config import Config
from io import BytesIO
from base64 import b64decode
from pypdf import PdfReader

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

def validate_pdf(file_stream):
    """Validate the PDF using pypdf"""
    try:
        pdf = PdfReader(file_stream)
        return {"valid": True, "num_pages": len(pdf.pages)}
    except Exception as e:
        return {"valid": False, "error": str(e)}


def lambda_handler(event, context):
    """Handle incoming PDF file & CORS preflight requests"""
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
        print(f"📂 Using S3 Endpoint: {LOCALSTACK_ENDPOINT}")
        print(f"📂 Using Bucket: {S3_BUCKET_NAME}")

        is_base64_encoded = event.get("isBase64Encoded", False)
        body = event["body"]

        file_content = b64decode(body) if is_base64_encoded else body.encode("latin1")
        file_stream = BytesIO(file_content)

        print(f"📂 File content length: {len(file_content)} bytes")

        validation_result = validate_pdf(file_stream)

        file_key = f"{context.aws_request_id}.pdf"

        print(f"🛠 Uploading file to S3: {LOCALSTACK_ENDPOINT}, Bucket: {S3_BUCKET_NAME}, Key: {file_key}")

        response = s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=file_key, Body=file_content, ContentType="application/pdf")

        print(f"✅ S3 Upload Response: {response}")

        file_url = f"{LOCALSTACK_ENDPOINT}/{S3_BUCKET_NAME}/{file_key}"

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({
                "message": "File uploaded successfully",
                "file_key": file_key,
                "file_url": file_url,
                "validation_result": validation_result
            })
        }

    except Exception as e:
        print(f"🔥 Error in lambda_handler: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }