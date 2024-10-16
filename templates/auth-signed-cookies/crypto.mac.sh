#!/bin/bash
policy=$(tr -d " \t\n\r" < policy.json)

cloudfront_policy=$(echo -n "$policy" | base64 -b 10000 | tr -- '+=/' '-_~')

signature=$(echo -n "$policy" | openssl dgst -sha1 -sign private_key2.pem | openssl base64 -A)
encoded_signature=$(echo -n "$signature" | tr -- '+=/' '-_~')

echo "Origin-Policy": $policy
echo
echo "Origin-Signature": $signature
echo
echo "CloudFront-Policy: $cloudfront_policy"
echo 
echo "CloudFront-Signature: $encoded_signature"
