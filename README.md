# PDF over the wire with Lambda and LocalStack

## Prerequisites

### Start LocalStack

```sh
docker run --rm -it -p 127.0.0.1:4566:4566 -p 127.0.0.1:4510-4559:4510-4559 -v /var/run/docker.sock:/var/run/docker.sock localstack/localstack
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
