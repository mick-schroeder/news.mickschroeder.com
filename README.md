# [🔀 News Shuffle](https://news.mickschroeder.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Assets: CC BY-NC 4.0](https://img.shields.io/badge/Content-CC%20BY--NC%204.0-blue.svg)](ASSET_LICENSE.md)

Take me to a random website, please.

Hit the "Shuffle" button and you will be sent to a random website from curated and aggregator-derived source lists across the web.

## Tech Stack

- [React](https://reactjs.org/)
- [Gatsby](https://www.gatsbyjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com)

## 🚀 Quick start

### Development

    ```shell
    git clone https://github.com/mick-schroeder/news.mickschroeder.com.git
    cd news.mickschroeder.com
    npm install
    npm run develop
    ```

    Open `http://localhost:8000`

### Production

    ```shell
    npm run build
    ```

## AWS access

AWS is only needed when working with the screenshot cache in S3. The screenshot
pipeline uses the defalt AWS SDK credential chain, so an AWS SSO profile,
`AWS_PROFILE`, or explicit temporary credentials all work.

The default screenshot bucket is `web-shuffle-screenshots` in `us-east-1`.

### Log in with AWS SSO

If the profile is already configured locally:

```shell
aws sso login --profile news-shuffle
export AWS_PROFILE=news-shuffle
export AWS_REGION=us-east-1
```

If you need to create the profile first:

```shell
aws configure sso --profile news-shuffle
```

Use the AWS access portal URL, account, and role for this project when prompted.
Then log in:

```shell
aws sso login --profile news-shuffle
```

Verify access:

```shell
aws sts get-caller-identity --profile news-shuffle
aws s3 ls s3://web-shuffle-screenshots --profile news-shuffle
```

For local development, you can put the profile in `.env.development`:

```shell
AWS_PROFILE=news-shuffle
AWS_REGION=us-east-1
SCREENSHOT_BUCKET=web-shuffle-screenshots
```

To run without S3, set `SKIP_S3=true`.

## Author

- [Mick Schroeder](https://mickschroeder.com)

## License

- News Shuffle™ is open-source and available under the [MIT License](LICENSE)
- Content (non-code): [CC BY-NC 4.0](CONTENT_LICENSE.md)

Logos, trademarks, and certain media assets may be excluded and remain All Rights Reserved unless explicitly licensed.
