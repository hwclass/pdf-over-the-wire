# PDF over the wire with Lambda and LocalStack

## Aim of the Proof of Concept

This proof of concept demonstrates how to upload, store, and retrieve PDF files using AWS Lambda and LocalStack. The repository provides a local development environment that simulates AWS services, allowing for testing and development without incurring costs or needing an internet connection.

## Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [LocalStack](https://localstack.cloud/docs/get-started/)

## Commands

### Start LocalStack

```sh
docker run --rm -it -p 4566:4566 localstack/localstack
```

### Create the local S3 bucket (pdf-upload-bucket)

```sh
aws --endpoint-url=http://localhost:4566 s3 mb s3://pdf-upload-bucket
```

### Build and run the API locally

```sh
sam build
sam local start-api --debug
```

### Upload a test file to the local S3 bucket (pdf-upload-bucket)

```sh
echo "Hello LocalStack S3" > testfile.txt
aws --endpoint-url=http://localhost:4566 s3 cp testfile.txt s3://pdf-upload-bucket/
```

### List the files in the local S3 bucket (pdf-upload-bucket)

```sh
aws --endpoint-url=http://localhost:4566 s3 ls s3://pdf-upload-bucket/
```

### Download PDF from the local S3 bucket (pdf-upload-bucket)

```sh
aws s3 cp s3://pdf-upload-bucket/<REQUEST-ID>.pdf ./<REQUEST-ID>.pdf --endpoint-url=http://localhost:4566
open <REQUEST-ID>.pdf
```

### Test uploading the PDF to the local S3 bucket (pdf-upload-bucket)

```sh
curl -X POST "http://127.0.0.1:3000/upload" \
     -H "Content-Type: application/pdf" \
     --data-binary "@api/Test_Invoice.pdf"
```

### Install diff-pdf

```sh
brew install diff-pdf
```

### Compare the original PDF with the downloaded PDF

```sh
diff-pdf api/Test_Invoice.pdf api/9fa9f0f2-eb3d-44fe-a919-f8bbe3189ba0.pdf --view
```

## Upload from the frontend

### Run the UI

```sh
npm run dev # go to http://localhost:5176 & upload a PDF file & click on Upload PDF
```

### Compare the original PDF with the downloaded PDF

```sh
diff-pdf api/Test_Invoice.pdf api/9fa9f0f2-eb3d-44fe-a919-f8bbe3189ba0.pdf --view
```

## For PDF/A-3 Convert Flow

* Compile and run the lambda function locally (under /convert directory)
* Upload a PDF file to the local S3 bucket (pdf-upload-bucket)
* Run the command for converting the PDF to PDF/A-3 (Includes output indent, mark info and adding metadata - embedding fonts are excluded now due to the GhostScript complexity)
* Download the PDF file from the local S3 bucket (pdf-upload-bucket - it should be named as converted-<PDF-ID>.pdf)
* Compare the original PDF with the downloaded PDF (Todo)

## Notes

* You can find the profile files within the /api/convert directory (sRGB_v4_ICC_preference.icc)