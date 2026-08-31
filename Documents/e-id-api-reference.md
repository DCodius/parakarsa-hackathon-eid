# e.id / IDChain API Reference

API documentation for the **e.id / IDChain** platform — Issuer, Holder, Verifier, OAuth SSO, KYC Gateway, and Template APIs.

**Base URLs:** Sandbox `https://gateway-sandbox.e.id` · Production `https://gateway.e.id`

Source: [docs.e.id/en](https://docs.e.id/en) — extracted 2026-08-31.

---

## Contents


- [OAuth SSO API](#oauth-sso-api)
- [Issuer API](#issuer-api)
- [Holder API](#holder-api)
- [Verifier API](#verifier-api)
- [KYC Gateway API](#kyc-gateway-api)
- [Template API](#template-api)

---


# OAuth SSO API

## Overview

Sign users in to your app with their e.id account using OAuth 2.0 SSO.

e.id provides a **Single Sign-On (SSO)** service that lets users sign in to third-party applications
with their e.id account. By using e.id SSO, applications reduce the need for users to create new
accounts and gain a more secure, centralized way to authenticate users.

With e.id SSO, clients benefit from:

- Reduced account friction for end users.

- Centralized authentication and improved security.

- Clear user consent and protected data access.
## How the OAuth flow works

The flow below shows the full sign-in sequence — from showing the "Sign in with e.id" button in your
app to reading the user's profile.

- **Show your login button** — call **Get App Name** ( GET /oauth/client/:client_id/:callback_url ) to fetch the registered app name, icon and scopes, then render your "Sign in with e.id" button.

- **Send the user to e.id** — redirect them to **Verify Client** ( GET /oauth/verify?client_id=…&callback_url=… ). e.id shows the login and consent page.

- **Receive the code** — after the user signs in and approves, e.id redirects back to your callback_url with a one-time authorization code .

- **Exchange the code for a token** — call **Get OAuth Token** ( POST /oauth/get-token ) with your client_id , client_secret and the code to receive a short-lived Bearer token . The code is single-use — a second exchange returns INVALID_OR_EXPIRED_CODE .

- **Read the profile** — call **Get Profile** ( GET /oauth/get-profile?scope=email:profile ) with the token in the Authorization header to get the user's profile data.
## Base URLs

- 🛠️ Sandbox (testing/development): https://api-dev.e.id 

- 🌍 Production (live): https://api-wallet.e.id 
## Key Features

- Compliance with modern authentication standards for strong security.

- Single sign-on so users authenticate once for multiple apps.

- User data protection via encryption and explicit access controls.
## How to obtain a client_id

- Create an e.id account (if you don't already have one).

- Submit a developer application via the e.id **Settings** page.

- After approval, create an OAuth application in the developer dashboard.

- Once the application is created you will receive a client_id and client_secret to use the API.
## Trust Level

To use the e.id SSO service, users must complete a verification process, divided into tiers based on
the level of identity verification required.

- **Unverified — Tier 0** — users not yet verified. Cannot access any features.

- **Basic — Tier 1** — email and phone number verified. Can access basic features and some advanced features.

- **Moderate — Tier 2** — email, phone number and formal ID verified. Can access all features, including advanced features.
## Endpoint guide

Every endpoint, grouped exactly like the sidebar menu and the Postman collection. Each name links to
the full reference with request and response examples you can copy.

Quick answers

- Adding **"Sign in with e.id"** to your app? → call the four endpoints below in order.

- Token exchange failing? → the code is **single-use**; get a fresh one via Verify Client.

- Need the user's **email**? → call Get Profile with scope=email:profile .
### 🔑 OAuth

The full sign-in flow in call order — from rendering your login button to reading the user's profile.

| Endpoint| Method| What it does & when to use it
| Get App Name| GET| Fetches your registered app_name , icon_url and scopes — use it to render a correct "Sign in with e.id" button. Returns 404 OAUTH.CLIENT_NOT_FOUND when the client_id / callback_url pair isn't registered.
| Verify Client| GET| The door into e.id: redirect the **user's browser** here. A valid client is sent to the e.id login page, an invalid one to the unauthorized-client page. After consent, the user returns to your callback_url with a one-time code .
| Get OAuth Token| POST| Server-to-server: exchanges the one-time code (plus client_id , client_secret , redirect_uri ) for a Bearer token . The code is **single-use** — reusing it returns 400 OAUTH.INVALID_OR_EXPIRED_CODE .
| Get Profile| GET| Reads the signed-in user's profile with the Bearer token. scope is optional — default profile ; use email:profile to also receive the email. Missing/invalid token returns 401 UNAUTHORIZATION .
## Postman Collection

You can use this Postman Collection for reference.

Download Collection
## API Version Migration
### What changed in v1.1

- **Parameter Naming:** Changed from camelCase to snake_case (e.g., clientId → client_id ).

- **URL Standardization:** Some endpoints use standardized URLs (e.g., getProfile → get-profile ).

- **Enhanced Documentation:** More detailed examples and response schemas.

- **Improved Error Handling:** Better error responses and status codes.
### Migration recommendations

- **Test early** — start testing v1.1 endpoints in your development environment.

- **Update parameters** — use snake_case parameters in v1.1.

- **Review endpoints** — check for any URL changes in the endpoints you use.
###

---

## App Name

This endpoint is used to get client data by clientId and callbackUrl.
## Path Parameters

client_idstring

Unique application ID registered in the OAuth system.

callback_urlstring

Callback URL that will be used after authentication.## Response Body200

Successful response returning client info.

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object

Show Attributes

app_name?string

Registered display name of the client application.

icon_url?string

URL of the client application's icon.

Format uri 

callback_url?string

Callback URL that will be used after authentication.

scopes?array<string>

OAuth scopes granted to this client.Array Item

No Description404

Client not found for the given client_id / callback_url.

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object | null

Additional description or notes.

Empty Object

cURLJavaScriptGoPythonJavaC#Example successful response{
 "status": true,
 "message": "success",
 "data": {
 "app_name": "Example App",
 "icon_url": "https://example.com/oauth-icon.png",
 "callback_url": "https://example.com/callback",
 "scopes": [
 "email",
 "profile"
 ]
 }
} Client not found {
 "status": false,
 "message": "OAUTH.CLIENT_NOT_FOUND",
 "data": null
}

---

## Client Verification

Browser entry point of the SSO flow: redirect the user's browser here. e.id validates the
 client_id and callback_url , then responds with a **302 redirect** — to the e.id login page when
the client is valid, or to the unauthorized-client page when it is not.
## Query Parameters

client_idstring

Unique application ID registered in the OAuth system.

callback_urlstring

Callback URL that will be used after authentication.## Response Body302

Redirect response (no JSON body). Valid client → Location: https://wallet-sandbox.e.id/auth/login where the user signs in and consents. Invalid client or callback URL → Location: https://wallet-sandbox.e.id/oauth/unauthorized-client .

cURLJavaScriptGoPythonJavaC#Empty

---

## Access Token

This endpoint is used to obtain an OAuth token after the authorization process is successful. The client must send client_id, client_secret, code, and redirect_uri.
## Request Body

client_idstring

A unique application ID using OAuth.

client_secretstring

The application secret used for authorization.

codestring

The authorization code obtained from the OAuth process.

redirect_uristring

The redirect URL that matches the registered one.## Response Body200

Successful token generation

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object

Show Attributes

token_type?string

Type of the token (e.g., Bearer).

token?string

Random token generated by the system.

expired_date?string

Expiration date of the token.

Format date-time 400

The authorization code is invalid or has already been used (codes are single-use).

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object | null

Additional description or notes.

Empty Object401

Invalid client credentials (client_id / client_secret).

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object | null

Additional description or notes.

Empty Object

cURLJavaScriptGoPythonJavaC#Example successful response{
 "status": true,
 "message": "success",
 "data": {
 "token_type": "Bearer",
 "token": "example-access-token",
 "expired_date": "2026-07-20T03:01:57Z"
 }
} Invalid or expired code {
 "status": false,
 "message": "OAUTH.INVALID_OR_EXPIRED_CODE",
 "data": null
} Invalid client credentials {
 "status": false,
 "message": "OAUTH.INVALID_CLIENT_CREDENTIALS",
 "data": null
}

---

## User Profile

This endpoint is used to retrieve user profile data based on the given scope. The request must include an Authorization header with a valid OAuth token.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

scope?string

The scope that determines the returned profile data (e.g., email:profile).

Default "profile" ## Response Body200

Successful profile data retrieval

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object

Show Attributes

email?string

User's email address.

profile?object

User profile data based on the requested scope.Show Attributes

address?string

User's address information.

avatar?string

User's avatar image URL.

countryphonecode?string

User's country phone code.

fullname?string

User's full name.

phonenumber?string

User's phone number.

tier?integer

Unauthorized - Invalid or missing OAuth token

status?boolean

Status of the request (e.g., success, error).

message?string

Message displayed to the user.

data?object | null

Additional description or notes.

Empty Object

cURLJavaScriptGoPythonJavaC#Example successful response{
 "status": true,
 "message": "success",
 "data": {
 "email": "user@example.com",
 "profile": {
 "address": "",
 "avatar": "",
 "countryphonecode": "62",
 "fullname": "Example Name",
 "phonenumber": "81234567890",
 "tier": 2
 }
 }
} Unauthorized {
 "status": false,
 "message": "UNAUTHORIZATION",
 "data": null
}

---


# Issuer API

## Overview

Issue and manage verifiable credentials as an Issuer (Controller).

The **Issuer API** (also called the *Controller* API) lets an organization issue verifiable
credentials to holders on the IDChain network. As an issuer you can:

- Define **document schemas** — the shape of the credentials you issue.

- Enable **auto issuance** so holders can claim credentials directly from their app.

- Browse and inspect the **verifiable credentials** you have issued.

- **Revoke** credentials when they are no longer valid.

- Monitor issuance activity from the **dashboard** statistics.
## How the Issuer flow works

A typical integration goes from authenticating, to defining what a credential looks like, to letting
holders claim it, and finally tracking and managing what you have issued.

Want to join as an issuer? Start here

**Step 0 — get onboarded.** Contact support to be onboarded and receive your client_id &
 client_secret (see Getting Access). Once you have credentials, follow steps 1–6
below — the key part is **building your Verification Endpoint** so credentials can be issued automatically.

- **Authenticate** — call **Authentication → Get Access Token** with your issuer client_id and client_secret to obtain a Bearer token used on every other request.

- **Define a document schema** — call **Document Schema → Create Schema** to declare the fields your credential contains ( category , fields , and whether it supports auto-issuance).

- **Set your URLs & build your verification endpoint** — in **Profile → Update Profile**, set default_verify_url (your own endpoint that verifies the holder) and default_webhook_url (where result notifications are sent). Then **build your verification endpoint** to match the contract in Verification Endpoint so credentials are issued automatically.

- **Holders claim the credential** — with auto-issuance enabled, a holder requests the credential from their app. The **e.id Gateway** calls your Verification Endpoint to verify the holder, issues the credential on-chain, then sends an Auto Issuance Webhook with the result to your default_webhook_url .

- **Track & monitor** — use **Auto Issuance** (list, stats, detail) to follow each run's kyc_status , credential_status and overall status , and check the **Dashboard** statistics for an overview anytime.

- **Manage & revoke** — browse what you've issued with **Verifiable Credential** (list & detail), and **Revoke** a credential when it is no longer valid.

Need a certificate/card image for the credential?

Your Verification Endpoint response can include
 generated_image_url — the image shown in the holder's wallet. Don't want to build a renderer
yourself? Use the ****: design the card once in its hosted editor, then
call **Generate to URL** with the holder's verified data
inside your verification endpoint handler to get back a ready-to-use image URL.
## Base URLs

- 🛠️ Sandbox: https://gateway-sandbox.e.id 

- 🌍 Production: https://gateway.e.id 
## Getting Access

Access to the Issuer API is granted through our support team. Your organization must be onboarded
before you can use the API.

Contact support to get started

To be registered as an Issuer, reach out to **support@corp.e.id**. Once your organization is
approved and onboarded, support will provide the client_id and client_secret you use to
authenticate with the API.
## Authentication

All endpoints require a Bearer token. Call **Authentication → Get Access Token** with the issuer
 client_id and client_secret provided by support, then send the returned token in the
 Authorization header on every request.
## Endpoint guide

Every endpoint, grouped exactly like the sidebar menu and the Postman collection. Each name links to
the full reference with request and response examples you can copy.

Quick answers

- Want to issue a **new type of credential**? → Create Schema

- How do I **verify the holder & issue** the credential (the endpoint you must build)? → Verification Endpoint

- Did a **holder receive their credential**? → List Auto Issuance

- Need to **invalidate a credential**? → Revoke Credential

- Building a **monitoring dashboard**? → the three Dashboard endpoints
### 🔐 Authentication

Gets and manages the Bearer token that secures every other call.

| Endpoint| Method| What it does & when to use it
| Get Access Token| POST| Exchanges your client_id + client_secret for a short-lived Bearer token. **Always your first call.**
| Refresh Token| POST| Gets a new access token from your refresh_token without re-sending credentials. Use when the token expires.
| Logout| POST| Invalidates the current token/session. Use it when rotating credentials or closing a session.
### 📊 Dashboard

Read-only statistics — ideal for an admin dashboard of your issuance activity.

| Endpoint| Method| What it does & when to use it
| VC Summary| GET| Credential counts (total / active / expired) for today, this month and this year — a full overview in one call.
| VC Total| GET| Lifetime totals for your account: active, revoked and expired credentials.
| VC per Schema| GET| The same counts broken down per document schema — see which credential type is used most.
### 👤 Profile

Your issuer account and its callback settings.

| Endpoint| Method| What it does & when to use it
| Get Profile| GET| Shows your account: DID, on-chain address and current webhook settings.
| Update Profile| PUT| Sets default_verify_url (your verification endpoint the e.id Gateway calls mid-issuance) and default_webhook_url (where result notifications are sent). See Event Callbacks for the roles of each.
### 📄 Document Schema

A document schema defines the **fields a credential contains**. You need one before anything can be issued.

| Endpoint| Method| What it does & when to use it
| List Schemas| GET| Browses your schemas with pagination and filters.
| Schema Detail| GET| One schema by id , including its full field definitions.
| Create Schema| POST| Registers a new schema on-chain. category is identity or asset , and each field's input.type controls how the e.id app renders it.
| Delete Schema| DELETE| Soft-deletes a schema by id when you stop issuing that credential type.
### 🎫 Verifiable Credential

Browse and manage every credential you have issued.

| Endpoint| Method| What it does & when to use it
| | GET| Every issued credential, filterable by status, subject DID and schema.
| Credential Detail| GET| One credential by id , including revocation data when present.
| List Revocations| GET| Credentials that have revocation requests, filterable by revocation_status (requested / approved).
| Revoke Credential| POST| Revokes a credential by id with a reason — for example fraud or outdated data.
### ⚙️ Auto Issuance

Auto-issuance runs verification + issuance automatically when a holder claims your credential from
their app. These endpoints let you monitor those runs.

| Endpoint| Method| What it does & when to use it
| List Auto Issuance| GET| Every run with its kyc_status , credential_status and overall status — check here when a holder says "I claimed it but got nothing".
| Auto Issuance Stats| GET| Aggregate counts by status: started, processing, finished, failed.
| Auto Issuance Detail| GET| One run by id , including retry counts and metadata — useful for debugging a stuck issuance.
### 🔔 Event Callbacks

Endpoints on **your** side that the **e.id Gateway** interacts with during auto-issuance. These are not
endpoints you call — they are the ones the gateway calls on you.

| Page| Direction| What it does & when to use it
| Verification Endpoint| Gateway → You| The default_verify_url endpoint you **must build** — called mid-flow to verify the holder and return the credential data. Decides whether a credential is issued.
| Auto Issuance Webhook| Gateway → You| The result payload sent to default_webhook_url when a run completes ( finished / failed ). Notification only.
## Postman Collection

Download Collection
###

---

## Get Access Token

Exchange your issuer client_id and client_secret for a short-lived Bearer access token. Every other Issuer endpoint requires this token in the Authorization: Bearer example-access-token header, so call this first.
## Request Body

client_idstring

Your application client ID.

client_secretstring

Your application client secret.## Response Body200

Access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid credentials

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid credentials",
 "status": false,
 "data": null
}

---

## Refresh Token

Obtain a new access token using a previously issued refresh_token , without re-sending your credentials.
## Request Body

refresh_tokenstring
## Response Body200

New access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid or expired refresh token

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid or expired refresh token",
 "status": false,
 "data": null
}

---

## Logout

Invalidate the current token/session using the Bearer token in the request.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Logged out

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

message?string

Message displayed to the user.401

Unauthorized

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "message": "logged out"
 }
} Example default {
 "code": 401,
 "message": "unauthorized",
 "status": false,
 "data": null
}

---

## VC Summary

Dashboard statistics: total, active, and expired credential counts for today, this month, and this year.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Credential statistics

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

total?object

Total number of items (or totals grouping).Show Attributes

today?integer

Count for today.

monthly?integer

Count for this month.

yearly?integer

Count for this year.

active?object

Active credentials grouping.Show Attributes

today?integer

Count for today.

monthly?integer

Count for this month.

yearly?integer

Count for this year.

expired?object

Expired credentials grouping.Show Attributes

today?integer

Count for today.

monthly?integer

Count for this month.

yearly?integer

Count for this year.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Successfully retrieved credential statistics",
 "status": true,
 "data": {
 "total": {
 "today": 0,
 "monthly": 18,
 "yearly": 18
 },
 "active": {
 "today": 0,
 "monthly": 18,
 "yearly": 18
 },
 "expired": {
 "today": 0,

 "yearly": 0
 }
 }
}

---

## VC Total

Total active / revoked / expired credential counts per issuer account.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Credential totals

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?array<object>

Response payload.Array Item

No Description

issuer_account_id?string

Issuer account UUID.

issuer?string

Issuer name.

total_active?integer

Number of active credentials.

total_revoked?integer

Number of revoked credentials.

total_expired?integer

Number of expired credentials.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Successfully retrieved credential statistics",
 "status": true,
 "data": [
 {
 "issuer_account_id": "00000000-0000-0000-0000-000000000000",
 "issuer": "Example Issuer Org",
 "total_active": 18,
 "total_revoked": 0,
 "total_expired": 0
 }
 ]
}

---

## VC per Schema

Credential counts broken down per document schema.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Credential details per schema

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

issuer_account_id?string

Issuer account UUID.

issuer?string

Issuer name.

credentials?array<object>

Per-schema credential breakdown.Array Item

No Description

doc_schema_id?string

Related document schema UUID.

schema_title?string

Schema title (name-version).

total_active?integer

Number of active credentials.

total_revoked?integer

Number of revoked credentials.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Successfully retrieved credential details",
 "status": true,
 "data": {
 "issuer_account_id": "00000000-0000-0000-0000-000000000000",
 "issuer": "Example Issuer Org",
 "credentials": [
 {
 "doc_schema_id": "00000000-0000-0000-0000-000000000000",
 "schema_title": "example-membership",
 "total_active": 15,
 "total_revoked": 0,
 "total_expired": 0
 },
 {

 "schema_title": "example-workshop-event",
 "total_active": 1,
 "total_revoked": 0,
 "total_expired": 0

 ]
 }
}

---

## Get Profile

Retrieve your issuer (controller) account profile, including DID, address, and webhook settings.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Issuer profile

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

username?string

Account display name.

client_id?string

Account client ID.

client_secret?string

Account client secret.

client_role?string

Account role (controller / verifier / claimer).

platform_id?string

Platform UUID.

platform?object

Platform the account belongs to.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

name?string

Name.

address?string

Short account address (without platform suffix).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

developer_key?string | null

Developer key (null if not set).

developer_key_path?string | null

Developer key path (null if not set).

has_token?boolean

Whether the account currently holds a valid token.

rate_limit_per_minute?integer

Allowed requests per minute.

total_failed_request?integer

Number of failed requests.

is_access_locked?boolean

Whether account access is locked.

eidchain_status?string

On-chain registration status.

eidchain_failure_count?integer

On-chain registration failure count.

eidchain_last_retry_at?string

Timestamp of the last on-chain retry.

eidchain_did?string

eidchain_address?string

On-chain SS58 address.

default_webhook_url?string | null

Default webhook URL for events.

default_verify_url?string | null

Default KYC verification callback URL.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "created_at": "2026-07-17T04:32:13.310699Z",
 "updated_at": "2026-07-17T04:32:42.359256Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "client_id": "example-client-id",
 "client_secret": "example-client-secret",
 "client_role": "controller",
 "is_internal": true,
 "platform_id": "00000000-0000-0000-0000-000000000000",

 "created_at": "2025-12-01T08:45:45.185829Z",
 "updated_at": "2025-12-01T08:45:45.185829Z",
 "id": "00000000-0000-0000-0000-000000000000",

 },
 "address": "example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 "developer_key": null,
 "developer_key_path": null,
 "has_token": true,

 "total_failed_request": 0,
 "is_access_locked": false,
 "eidchain_status": "success",
 "eidchain_failure_count": 0,

 "eidchain_did": "did:eid:example",
 "eidchain_address": "example-onchain-address",
 "default_webhook_url": null,

 }
}

---

"eidchain_last_retry_at": "2026-07-17T04:32:39.395273Z",

---

## Create Schema

Register a new document schema on-chain. This defines the fields a credential will contain — category must be identity or asset , and each field's input.type controls how the e.id app renders it.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

schema_namestring

Human-readable name of the schema.

description?string

Short description of what this schema is for.

categorystring

Schema category — only identity or asset .

Value in "identity" | "asset" 

mandatory_kyc_file?boolean

Whether the holder must upload a KYC file.

versioninteger

Schema version number.

default_vc_duration?integer

Default credential validity, in days.

is_public?boolean

true = publicly listed; false = private (accessed via private_code ).

is_free?boolean

Boolean flag on the schema; when false , price_usd / price_idr apply.

price_idr?number | null

fieldsarray<object>

The credential's field definitions.Array Item

No Description

name?string

Field key/name.

description?string

What this field represents.

type?string

IDChain data type (e.g. string , number ).

input?object

UI input hint {type, value} . type = string | number | email | date | dropdown; value = options for dropdown.

Empty Object

required?boolean

Whether this field is required.## Response Body201

Schema created

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

private_code?string

Access code for private schemas.

required_fields?array<string>

Fields required by the schema.Array Item

No Description400

UID document already exists

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Document schema created successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "private_code": "example-private-code",
 "created_at": "2026-07-17T07:12:27.128663861Z",
 "required_fields": [
 "fullname",
 "email",
 "gender"
 ]
 }
} Example default {
 "code": 400,
 "message": "UID Document already exist",
 "status": true,
 "data": null
}

---

## Schema Detail

Retrieve one document schema by its id , including its full field definitions.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

doc_schema.id## Response Body200

Document schema detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

document_uid?string

On-chain document UID.

schema_name?string

Schema name.

description?string

Description.

category?string

mandatory_kyc_file?boolean

Whether a KYC file upload is required.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema auto-issues credentials.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Boolean flag on the schema.

price_usd?string | null

USD amount; null when is_free is true .

private_code?string

Access code for private schemas.

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

Type.

value?array<unknown>

Allowed values (e.g. dropdown options).Array Item

No Description

required?boolean

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

created_by?string

DID of the creator.

deleted_by?string | null

DID of who deleted it (null if active).

issuer_id?string

Issuer account UUID.

issuer?object

Issuer name.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

client_role?string

Account role (controller / verifier / claimer).

is_internal?boolean

Whether the account is internal to the platform.

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

has_token?boolean

Whether the account currently holds a valid token.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-17T07:12:27.128663Z",
 "updated_at": "2026-07-17T07:12:42.074414Z",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",
 "schema_name": "membership-card",
 "description": "Example membership credential schema",
 "version": 1,
 "category": "identity",

 "default_vc_duration": 365,
 "is_auto_issuance": true,
 "is_public": false,

 "price_usd": null,
 "price_idr": null,
 "private_code": "example-private-code",

 {
 "name": "fullname",
 "type": "string",
 "input": {
 "type": "string",

 },
 "required": true,
 "description": "Fullname of the claimer"
 },
 {
 "name": "email",

 "input": {
 "type": "email",
 "value": []
 },

 "description": "Email address of the claimer"
 },
 {
 "name": "gender",
 "type": "string",

 "type": "dropdown",
 "value": [
 "male",
 "female"
 ]
 },

 "description": "Gender of the claimer"
 }
 ],
 "required_fields": [
 "fullname",
 "email",
 "gender"
 ],

 "deleted_by": null,
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer": {

 "username": "example-username",
 "client_role": "controller",
 "is_internal": true,

 "idchain_address": "example-onchain-address",
 "did": "did:eid:example",
 "has_token": true
 }
 }
}

---

## List Schemas

List the document schemas you have created — the shape (fields) of the credentials you issue — with pagination and optional filters.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

schema_name?string

Filter by schema name

schema_title?string

Filter by schema title

is_public?string

Filter by public flag: true / false

is_auto_issuance?string

Filter by auto-issuance flag: true / false

date_to?string

End date (YYYY-MM-DD)## Response Body200

List of document schemas

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

issuer_id?string

Issuer account UUID.

issuer_name?string

Issuer organization name.

document_uid?string

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

mandatory_kyc_file?boolean

Whether a KYC file upload is required.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema auto-issues credentials.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Boolean flag on the schema.

price_usd?string | null

USD amount; null when is_free is true .

private_code?string

Access code for private schemas.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

deleted_at?string | null

Deletion timestamp (null if active).

deleted_by?string | null

DID of who deleted it (null if active).

total?integer

Total number of items (or totals grouping).

current_page?integer

Current page number.

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-15T07:30:00.359387Z",
 "updated_at": "2026-07-15T07:30:30.100816Z",
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer_did": "did:eid:example",
 "issuer_name": "Example Issuer Org",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "description": "Example membership credential schema",
 "version": 1,
 "category": "identity",

 "default_vc_duration": 365,
 "is_auto_issuance": true,
 "is_public": false,

 "price_usd": null,
 "price_idr": null,
 "private_code": "example-private-code",

 "subject_id",
 "fullname",
 "email"
 ],
 "deleted_at": null,
 "deleted_by": null
 }

 "total": 12,
 "total_pages": 2,
 "current_page": 1,
 "next_page": 2,

 "per_page": 10
 }
}

---

## Delete Schema

Soft-delete a document schema by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

doc_schema.id## Response Body204

Schema deleted (no content)

cURLJavaScriptGoPythonJavaC#Empty

---

## Credential Detail

Retrieve one credential by its id , including revocation data when applicable.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id## Response Body200

Credential detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Related document schema.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Subject (holder) account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

status?string

Status of the request (true = success).

is_claimed?boolean

Whether the credential has been claimed.

is_downloaded?boolean

Whether the credential has been downloaded.

revocation_status?string

Revocation status (none / requested / approved).

digital_asset_url?string

URL of the credential's digital asset image.

share_code?string

Shareable code for the credential.

gateway_kyc_id?string

Gateway KYC record UUID.

idchain_kyc_id?string

IDChain KYC record UUID.

revocation_data?object

Revocation request / approval details.Show Attributes

request_reason?string | null

Reason given for the revocation request.

requested_at?string | null

When revocation was requested.

revoked_reason?string | null

Reason the credential was revoked.

revoked_at?string | null

When the credential was revoked.404

Credential not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-15T04:52:24.161758Z",
 "updated_at": "2026-07-15T04:56:30.098869Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",
 "schema_name": "membership-card",
 "description": "Example membership credential schema",

 "required_fields": [
 "subject_id",
 "fullname",
 "email"
 ]
 },
 "issuer_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "subject_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "issuance_date": "2026-07-15T04:52:24.133419Z",

 "status": "ACTIVE",
 "is_claimed": true,
 "is_downloaded": false,

 "revocation_status": "none",
 "digital_asset_url": "https://example.com/credential-asset.jpg",
 "share_code": "example-share-code",

 "idchain_kyc_id": "00000000-0000-0000-0000-000000000000",
 "revocation_data": {
 "request_reason": null,
 "requested_at": null,

 "revoked_at": null
 }
 }
} Example default {
 "code": 404,
 "message": "credential not found",
 "status": false
}

---

## List Credentials

List the verifiable credentials you have issued, with pagination, sorting, and optional filters (status, subject DID, schema).
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

sort_order?string

Sort by created_at: asc / desc

status?string

Filter by status: ACTIVE / REVOKED

schema_id?string

doc_schema uuid(s), comma-separated## Response Body200

List of credentials

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

current_page?integer

Current page number.

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Related document schema.Show Attributes

id?string

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Subject (holder) account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

revocation_date?string | null

Revocation timestamp (null if not revoked).

status?string

Status of the request (true = success).

is_claimed?boolean

Whether the credential has been claimed.

is_downloaded?boolean

Whether the credential has been downloaded.

revocation_status?string

Revocation status (none / requested / approved).

digital_asset_url?string

URL of the credential's digital asset image.

share_code?string

Shareable code for the credential.

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

prev_page?integer

Previous page number (0 if none).

total_pages?integer

Total number of pages.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "current_page": 1,
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-15T04:52:24.161758Z",
 "updated_at": "2026-07-15T04:56:30.098869Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "description": "Example membership credential schema",
 "category": "identity",
 "required_fields": [
 "subject_id",

 "email"
 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "subject_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "issuance_date": "2026-07-15T04:52:24.133419Z",
 "expiration_date": "2027-07-15T04:52:24.133419Z",
 "revocation_date": null,

 "is_claimed": true,
 "is_downloaded": false,
 "visibility": "private",

 "digital_asset_url": "https://example.com/credential-asset.jpg",
 "share_code": "example-share-code"
 }
 ],
 "next_page": 0,

 "prev_page": 0,
 "total": 3,
 "total_pages": 1
 }
}

---

## List Revocations

List credentials that have revocation requests, filterable by revocation_status (requested / approved).
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

sort_order?string

Sort by created_at: asc / desc

revocation_status?string

Optional: requested / approved## Response Body200

List of revocation requests

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

current_page?integer

Current page number.

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Related document schema.Show Attributes

id?string

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Subject (holder) account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

revocation_date?string | null

Revocation timestamp (null if not revoked).

status?string

Status of the request (true = success).

is_claimed?boolean

Whether the credential has been claimed.

is_downloaded?boolean

Whether the credential has been downloaded.

revocation_status?string

Revocation status (none / requested / approved).

digital_asset_url?string

URL of the credential's digital asset image.

share_code?string

Shareable code for the credential.

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

prev_page?integer

Previous page number (0 if none).

total_pages?integer

Total number of pages.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "current_page": 1,
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-15T04:52:24.161758Z",
 "updated_at": "2026-07-15T04:56:30.098869Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "description": "Example membership credential schema",
 "category": "identity",
 "required_fields": [
 "subject_id",

 "email"
 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "subject_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "issuance_date": "2026-07-15T04:52:24.133419Z",
 "expiration_date": "2027-07-15T04:52:24.133419Z",
 "revocation_date": null,

 "is_claimed": true,
 "is_downloaded": false,
 "visibility": "private",

 "digital_asset_url": "https://example.com/credential-asset.jpg",
 "share_code": "example-share-code"
 }
 ],
 "next_page": 0,

 "prev_page": 0,
 "total": 1,
 "total_pages": 1
 }
}

---

## Revoke Credential

Revoke an issued credential by its id , with a reason.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id
## Request Body

reasonstring
## Response Body200

Credential revoked

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

data?object

Response payload.Show Attributes

credential_id?string

Credential UUID.

record_id?string

Revocation record UUID.

uid_vc?string

On-chain verifiable credential reference (empty until the async blockchain update completes).400

Already revoked

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Credential revoked successfully (web2-first, blockchain update asynchronously)",
 "status": true,
 "data": {
 "credential_id": "00000000-0000-0000-0000-000000000000",
 "record_id": "00000000-0000-0000-0000-000000000000",
 "uid_vc": ""
 }
} Example default {
 "code": 400,
 "message": "credential is already revoked",
 "status": false
}

---

## Auto Issuance Detail

Retrieve one auto-issuance record by its id , including retry counts and metadata.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

auto_issuance.id## Response Body200

Auto-issuance detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

started_at?string

Process start timestamp.

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

idchain_address?string

On-chain SS58 address.

holder_account?object

Holder account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

doc_schema?object

Related document schema.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

kyc_id?string

KYC record UUID.

kyc_last_try_at?string | null

Timestamp of the last KYC attempt (null if none).

kyc_status?string

KYC step status.

credential_id?string

Credential UUID.

credential_last_try_at?string | null

Timestamp of the last credential-issuance attempt (null if none).

credential_status?string

Credential step status.

status?string

Status of the request (true = success).

kyc_retry_count?integer

KYC retry attempts used.

kyc_max_retries?integer

Maximum KYC retry attempts.

credential_retry_count?integer

Credential retry attempts used.

credential_max_retries?integer

Maximum credential retry attempts.

error_message?string | null

Error message (null on success).

error_details?string | null

Structured error details (null on success).

metadata?object

Additional process metadata.Show Attributes

eid?object

e.id purchase/order metadata.Show Attributes

eid_user_id?string

e.id user UUID.

eid_order_id?string

e.id order UUID.

purchased_at?string

Purchase timestamp.

verification?object

Verification result.Show Attributes

email?string

Email address.

fullname?string

Full name.

issued_at?string

expired_at?string

subject_id?string

Subject identifier.

identifier_no?string

Identifier number of the subject.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-06T05:59:18.241554Z",
 "updated_at": "2026-07-06T05:59:18.701002Z",
 "started_at": "2026-07-06T05:59:18.241219Z",
 "finished_at": "2026-07-06T05:59:18.692541Z",
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "doc_schema": {

 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",
 "schema_name": "membership-card",

 "category": "asset",
 "required_fields": [
 "subject_id",
 "fullname",
 "email"
 ]

 "kyc_id": "00000000-0000-0000-0000-000000000000",
 "kyc_last_try_at": null,
 "kyc_status": "approved",

 "credential_last_try_at": null,
 "credential_status": "issued",
 "status": "finished",

 "kyc_max_retries": 3,
 "credential_retry_count": 0,
 "credential_max_retries": 3,
 "error_message": null,

 "metadata": {
 "eid": {
 "eid_user_id": "00000000-0000-0000-0000-000000000000",
 "eid_order_id": "00000000-0000-0000-0000-000000000000",

 },
 "verification": {
 "email": "user@example.com",
 "fullname": "Example Name",

 "expired_at": "2026-06-19",
 "subject_id": "00000000-0000-0000-0000-000000000000",
 "identifier_no": "example-identifier"
 }
 }

}

---

## List Auto Issuance

List automated KYC + issuance processes and track each run's kyc_status , credential_status , and overall status .
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

status?string

Overall status: started | processing | finished | failed

kyc_status?string

KYC status filter## Response Body200

List of auto-issuances

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

current_page?integer

Current page number.

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

started_at?string

Process start timestamp.

finished_at?string

Process finish timestamp (null if unfinished).

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object

Holder account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

doc_schema?object

Related document schema.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

kyc_id?string

kyc_last_try_at?string | null

Timestamp of the last KYC attempt (null if none).

kyc_status?string

KYC step status.

credential_id?string

Credential UUID.

credential_last_try_at?string | null

Timestamp of the last credential-issuance attempt (null if none).

credential_status?string

Credential step status.

status?string

Status of the request (true = success).

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

prev_page?integer

Previous page number (0 if none).

total_pages?integer

Total number of pages.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "current_page": 1,
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-06T05:59:18.241554Z",
 "updated_at": "2026-07-06T05:59:18.701002Z",
 "started_at": "2026-07-06T05:59:18.241219Z",
 "finished_at": "2026-07-06T05:59:18.692541Z",
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },

 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",

 "schema_name": "membership-card",
 "description": "Example membership credential schema",
 "category": "asset",

 "subject_id",
 "fullname",
 "email"
 ]
 },
 "kyc_id": "00000000-0000-0000-0000-000000000000",

 "kyc_status": "approved",
 "credential_id": "00000000-0000-0000-0000-000000000000",
 "credential_last_try_at": null,

 "status": "finished"
 }
 ],
 "next_page": 0,
 "per_page": 10,

 "total": 6,
 "total_pages": 1
 }
}

---

## Auto Issuance Stats

Aggregate auto-issuance counts by overall status (started, processing, finished, failed).
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Auto-issuance statistics

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

failed?integer

Number of failed processes.

finished?integer

Number of finished processes.

processing?integer

Number of in-progress processes.

started?integer

Number of started processes.

total?integer

Total number of items (or totals grouping).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "failed": 0,
 "finished": 30,
 "processing": 0,
 "started": 0,
 "total": 30
 }
}

---

## Auto Issuance Webhook

The result payload the e.id Gateway sends to your webhook when an auto-issuance run finishes.

When an **auto-issuance** run finishes (whether it succeeds or fails), the **e.id Gateway** sends a
**POST** request to your callback URL (set via **Profile → Update Profile**, field
 default_webhook_url ). Use it to know the outcome without polling **Auto Issuance → List / Detail**.

Don't confuse this with the Verification Endpoint

This webhook ( default_webhook_url ) only **receives the final result**. The endpoint that actually
**verifies** the holder and decides whether a credential is issued is the
Verification Endpoint ( default_verify_url ),
which the e.id Gateway calls mid-flow.

The result mirrors the Auto Issuance record — the
** status ** field tells you the overall outcome.

| status | Meaning
| started · processing | Run is still in progress
| finished | KYC approved and credential issued
| failed | The run failed — see error_message 

Placeholder data

All identifiers below (all-zero UUIDs) are placeholders. Real callbacks contain your actual
 issuance_id , record_id , and credential_id .
## Success — finished 
{
 "issuance_id": "00000000-0000-0000-0000-000000000000",
 "record_id": "00000000-0000-0000-0000-000000000000",
 "status": "finished",
 "kyc_status": "approved",
 "credential_status": "issued",
 "credential_id": "00000000-0000-0000-0000-000000000000",
 "started_at": "2026-07-20T10:59:18Z",
 "finished_at": "2026-07-20T11:00:18Z",
 "error_message": null
}
## Failure — failed 

Same payload, with these fields changed:
{
 "status": "failed",
 "kyc_status": "rejected",
 "credential_status": "failed",
 "credential_id": null,
 "error_message": "KYC verification failed"
}
## Field reference

| Field| Description
| issuance_id | The auto-issuance process id — matches id in **Auto Issuance → Detail**.
| record_id | The subject_id you sent when the flow was triggered.
| status | Overall run status: started · processing · finished · failed .
| kyc_status | KYC step result: pending · approved · rejected .
| credential_status | Issuance step result: pending · issued · failed .
| credential_id | The issued credential id ( null if not issued).
| error_message | Filled only when status is failed .
###

---

## Verification Endpoint

Your own endpoint that the e.id Gateway calls mid-flow during auto-issuance to verify the holder and return the credential data.

This is **the step you must build yourself as an issuer.** Unlike the
Auto Issuance Webhook, which only *reports the
outcome at the end*, this endpoint is called by the **e.id Gateway** **in the middle of the flow** and
**decides** whether a credential is issued at all.

When a holder claims this credential, the e.id Gateway sends a **POST** request to the URL you set in
**Profile → Update Profile**, field ** default_verify_url **. This endpoint is where the actual
verification / KYC happens on your side: you decide whether the person is valid, then return the field
values of the credential to be issued.

Term: holder

**Holder** = the end user who receives the credential — also called a *user*. The holder interacts
through their own app/wallet (one of which is the e.id app), so don't read "holder" as one specific app.

This endpoint is what makes credentials issue automatically

Build this endpoint so the e.id Gateway can verify the holder and issue the credential automatically.
If default_verify_url is left empty, the e.id Gateway uses the platform's built-in issuer-management
system; if you set your own URL, that endpoint **must** follow the contract below for issuance to succeed.
## Where it sits in the flow

All communication goes through the **e.id Gateway**; the holder's app/wallet never calls your backend
directly.

| #| Event| Path
| 1| Holder/user claims the credential (via their app)| Holder → Gateway
| 2| **Gateway POSTs to your default_verify_url **| Gateway → **You**
| 3| You verify & reply { success, data } | **You** → Gateway
| 4| Gateway checks required_fields , then issues the VC on-chain| Gateway
| 5| Credential lands in the holder's wallet| Gateway → Holder
| 6| Gateway sends the result to default_webhook_url | Gateway → You

Two different URLs

 default_verify_url (step 2) = the **verification** endpoint called mid-flow that decides the outcome.
 default_webhook_url (step 6) = the **notification** endpoint that only receives the final result.
Both are set on the same endpoint, but their roles point in opposite directions.
## The request you receive

The e.id Gateway sends a POST with header Content-Type: application/json and this body:
{
 "private_code": "your-schema-private-code",
 "email": "holder@example.com",
 "identifier_no": "3201234567890001"
}

| Field| Description
| private_code | The private code bound to your document schema. Use it to confirm the request is legitimate and which credential type is being requested — treat it as a shared secret.
| email | Email of the holder claiming the credential.
| identifier_no | The holder's identity number (e.g. national ID) that you use to look the person up in your system.

Timeout

The e.id Gateway waits up to **300 seconds** for a response. Finish verification within that window; if
your endpoint does not respond, the run is treated as failed.
## The response you must return
### Success — verification passed

Return success: true together with a data object that **contains every required_field ** from
your document schema:
{
 "success": true,
 "data": {
 "fullname": "Budi Santoso",
 "email": "holder@example.com",
 "nik": "3201234567890001",
 "membership_tier": "gold",
 "generated_credential_id": "MEMBER-2026-000123",
 "generated_image_url": "https://cdn.you.id/cards/000123.png"
 }
}
### Failure — verification rejected

Return success: false . The run is marked failed and the holder receives no credential:
 { "success": false } 
## Validation rules the e.id Gateway applies to your response

- ** data must contain ALL required_fields ** you defined at **Create Schema**. If even one is
missing, the run fails with Missing required fields: [...] — even when success is true .

- Only fields listed in required_fields are stored as credential metadata. Anything else (except the
two optional fields below) is ignored.

- success: false → run failed , no credential issued.

| Field in data | Required?| Purpose
| Every name in the schema's required_fields | **Required**| Becomes the claims of the issued credential.
| generated_credential_id | Optional| Your own credential id; used by the gateway as the share_code (the credential's access code) and **must be unique**. If omitted, the e.id Gateway generates a ULID.
| generated_image_url | Optional| URL of the card/credential image shown in the holder's wallet.

Generating generated_image_url

Don't have a card/certificate renderer of your own? Use the **Template API** to design
the card once in its hosted editor, then call
**Generate to URL** with the holder's verified data right here
in this handler — it renders the image, uploads it, and returns a data.url you can pass straight
through as generated_image_url .
## What you should validate on your side

This endpoint is where you enforce your own business rules. At minimum we recommend:

- **Authenticate the request** — match private_code against your schema's value; reject if it doesn't match.

- **Find the person** — look the holder up by identifier_no and/or email in your database.

- **Decide eligibility** — run your KYC / membership checks. Not eligible → success: false .

- **Assemble data ** — fill every required_field with verified data (not the raw values from the request).

In short

 success: true means **you vouch** that this person is entitled to the credential, and data holds
the values that will be printed onto it. From there, on-chain issuance is handled by the e.id Gateway,
and the final result is sent back to your
 default_webhook_url .
###

---


# Holder API

## Overview

Browse credentials, complete auto-issuance, and manage your verifiable credentials as a Holder (Claimer).

The **Holder API** (also called the *Claimer* API) lets an application act on behalf of an end user
who holds — or wants to claim — verifiable credentials on the IDChain network. As a holder integration
you can:

- Browse **document schemas** to see which credentials are available to claim.

- Validate against an issuer's own records and run **auto issuance**.

- **Claim**, download and manage the **verifiable credentials** issued to you.

- Respond to **verification (VP) requests** from verifiers — approve or reject what you share.

- Track every step of issuance until a credential lands in your wallet.
## How the Holder flow works

A typical integration goes from authenticating, to browsing what can be claimed, to completing
auto-issuance, to claiming the resulting credential and presenting it when a verifier asks.

Want to integrate as a holder? Start here

**Step 0 — get onboarded.** Contact support to be onboarded and receive your client_id &
 client_secret (see Getting Access). Once you have credentials, follow steps 1–6
below.

- **Authenticate** — call **Authentication → Get Access Token** with your holder client_id and client_secret to obtain a Bearer token used on every other request.

- **Browse document schemas** — call **Document Schema → List Schemas** (and **Schema Detail**) to see what credentials are available, whether they auto-issue, and what fields they require.

- **Run auto-issuance** — call **Auto Issuance → Validate Issuer App Data** to check your identifying data against the issuer's records, then **Initiate Auto Issuance** so verification and issuance happen automatically.

- **Claim your credential** — once a credential has been issued, call **Verifiable Credential → Claim Issued VC** to record it against your DID, then **Download VC** to get the full W3C credential with its on-chain proof.

- **Present it on request** — when a verifier's QR asks for your credential (or you want to initiate your own share), use **Presentation** (Scan QR, then Approve/Reject, or Initiate/Rotate for a holder-initiated share).

- **Manage & track** — browse what you hold with **Verifiable Credential** (list & detail), control its visibility, request revocation when needed, and follow every **Auto Issuance** run's status.
## Base URLs

- 🛠️ Sandbox: https://gateway-sandbox.e.id 

- 🌍 Production: https://gateway.e.id 
## Getting Access

Access to the Holder API is granted through our support team. Your application must be onboarded
before you can use the API.

Contact support to get started

To be registered as a Holder integration, reach out to **support@corp.e.id**. Once your application is
approved and onboarded, support will provide the client_id and client_secret you use to
authenticate with the API.
## Authentication

All endpoints require a Bearer token. Call **Authentication → Get Access Token** with the holder
 client_id and client_secret provided by support, then send the returned token in the
 Authorization header on every request.
## Endpoint guide

Every endpoint, grouped exactly like the sidebar menu and the Postman collection. Each name links to
the full reference with request and response examples you can copy.

Quick answers

- Want to see **what credentials you can claim**? → List Schemas

- Need to **verify identity** before a credential can be issued? → Validate Issuer App Data

- Got a credential and need it recorded to your DID? → Claim Issued VC

- A verifier's QR is asking for your credential? → Scan QR for VP

- Want to check on a **stuck or failed** run? →
### 🔐 Authentication

Gets and manages the Bearer token that secures every other call.

| Endpoint| Method| What it does & when to use it
| Get Access Token| POST| Exchanges your client_id + client_secret for a short-lived Bearer token. **Always your first call.**
| Refresh Auth Token| POST| Gets a new access token from your refresh_token without re-sending credentials. Use when the token expires.
| Logout/Invalidate Token| POST| Invalidates the current token/session. Use it when rotating credentials or closing a session.
### 👤 Profile

Your holder account and its access status.

| Endpoint| Method| What it does & when to use it
| Get Profile| GET| Shows your account: DID, on-chain address, rate limit and access status.
### 📄 Document Schema

A document schema defines the **fields a credential contains** and whether it supports auto-issuance.

| Endpoint| Method| What it does & when to use it
| List All UID Schema| GET| Browses claimable schemas with pagination and filters — e.g. is_auto_issuance or exclude_active_credentials .
| Get Details Doc Schema| GET| One schema by id , including its full field definitions — check this before initiating auto-issuance.
### ⚙️ Auto Issuance

For schemas backed by an issuer's own records — validate and issue automatically, no manual review.

| Endpoint| Method| What it does & when to use it
| Issuer Apps Validate| POST| Checks your identifying data against the issuer's records before committing to a run.
| Initiate Issuer App| POST| Starts the run: verification, KYC and credential issuance happen automatically.
| List All| GET| Every run with its kyc_status , credential_status and overall status — check here if you claimed but got nothing.
| Get Details by ID| GET| One run by id , including retry counts and metadata — useful for debugging a failed or stuck run.
### 🎫 Verifiable Credential

Browse, claim and manage every credential issued to you.

| Endpoint| Method| What it does & when to use it
| List All| GET| Every credential issued to you, filterable by status, visibility and schema name.
| Get Details| GET| One credential by id , including revocation data when present.
| Claim Issued VC| POST| Records an issued credential against your DID so it shows up as yours.
| Download VC| POST| Downloads the full W3C credential JSON with its on-chain proof.
| Update VC Visibility| PUT| Switches a credential between public and private .
| Request VC Revocation| POST| Asks the issuer to revoke a credential, with a reason — e.g. outdated data.
| Cancel VC Revocation| POST| Cancels a pending revocation request before the issuer approves it.
| Filters - List Issuer| GET| Distinct issuers behind your credentials — handy for an issuer filter dropdown.
### 🔄 Presentation

Respond to a verifier's VP request, or initiate your own share.

| Endpoint| Method| What it does & when to use it
| | GET| Every VP session you have been part of, with its status.
| Get VP Session Details| GET| One session by id , including its QR challenge and qr_token .
| Get Details (simple)| GET| A lightweight view of a session — good for a confirmation screen before authentication.
| Initiate Presentation| POST| Starts a holder-initiated session and returns a QR for a verifier to scan.
| Rotate QR Token| POST| Refreshes the QR token/challenge of a holder-initiated session before it expires.
| Scan QR for VP| POST| Submits a verifier's scanned QR — moves the session to WAITING_APPROVAL .
| Approved Requested VP| POST| Approves a scanned request, choosing which credential to present.
| Reject Requested VP| POST| Rejects a scanned request, with a reason.
## Postman Collection

Download Collection
###

---

## Get Access Token

Exchange your holder client_id and client_secret for a short-lived Bearer access token. Use the returned token in the Authorization: Bearer example-access-token header for all other requests.
## Request Body

client_idstring

Your holder application client ID.

client_secretstring

Your holder application client secret.## Response Body200

Access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid credentials

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid credentials",
 "status": false
}

---

## Refresh Auth Token

Obtain a new access token using a previously issued refresh_token , without re-sending your client_id / client_secret .
## Request Body

refresh_tokenstring

Refresh token from a previous token response.## Response Body200

New access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid or expired refresh token

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid or expired refresh token",
 "status": false
}

---

## Logout / Invalidate Token

Invalidate the current access token. Requires a valid Bearer token in the Authorization header. Use it when rotating credentials or closing a session.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Logged out

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

message?string

Message displayed to the user.401

Unauthorized

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "message": "logged out"
 }
} Example default {
 "code": 401,
 "message": "unauthorized",
 "status": false,
 "data": null
}

---

## Get Profile

Retrieve your holder account profile: on-chain address, DID, developer key path and access status.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Holder profile

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

username?string

Account display name.

client_secret?string

OAuth client secret issued for this account. Keep this confidential.

client_role?string

Account role (claimer for holders).

platform_id?string

Unique identifier (UUID) of the platform this account is registered under.

platform?object

Platform your account is registered under.Show Attributes

created_at?string

Platform creation timestamp.

updated_at?string

Platform last-update timestamp.

id?string

Unique identifier (UUID).

name?string

Platform name.

address?string

Raw on-chain identity address.

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

developer_key?string

Developer API key, if issued (null otherwise).

developer_key_path?string

Storage path of the developer key file, if issued (null otherwise).

has_token?boolean

Whether the account currently holds an active session token.

rate_limit_per_minute?integer

Requests per minute allowed for this account.

total_failed_request?integer

Total failed requests recorded.

is_access_locked?boolean

Whether the account is currently locked out.

eidchain_status?string

eidchain_failure_count?integer

Number of failed eIDChain DID registration attempts.

eidchain_last_retry_at?string

Timestamp of the last eIDChain DID registration retry.

eidchain_did?string

DID registered on eIDChain (mirrors did).

eidchain_address?string

On-chain address registered on eIDChain (mirrors idchain_address).

default_webhook_url?string

Your configured webhook URL for async notifications (null if not set).

default_verify_url?string

Your configured verification endpoint URL (null if not set).

profile_visibility?string

Visibility of your profile to verifiers (e.g. private/public).

phone_visibility?string

Visibility of your phone number to verifiers (e.g. private/public).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "created_at": "2026-01-28T10:06:44.828482+07:00",
 "updated_at": "2026-01-28T10:07:35.616285+07:00",
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "client_id": "example-client-id",
 "client_secret": "example-client-secret",
 "client_role": "claimer",
 "is_internal": true,
 "platform_id": "00000000-0000-0000-0000-000000000000",

 "created_at": "2025-12-01T08:45:45.185829+07:00",
 "updated_at": "2025-12-01T08:45:45.185829+07:00",
 "id": "00000000-0000-0000-0000-000000000000",

 },
 "address": "example-onchain-address",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 "developer_key": null,
 "developer_key_path": null,
 "has_token": true,

 "total_failed_request": 0,
 "is_access_locked": false,
 "eidchain_status": "success",

 "eidchain_last_retry_at": "2026-01-28T10:07:35.616285+07:00",
 "eidchain_did": "did:eid:example",
 "eidchain_address": "example-onchain-address",
 "default_webhook_url": null,

 "profile_visibility": "private",
 "phone_visibility": "private"
 }
}

---

## List Document Schemas

List document (UID) schemas you can claim, with pagination and optional filters. Use enable_kyc=true to only show schemas that require KYC, and exclude_active_credentials=true to hide schemas you already hold an active credential for.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

schema_name?string

Filter by schema name

issuer_name?string

Filter by issuer username

category?string

Filter by category: identity / asset

is_public?string

Filter by public flag: true / false

exclude_active_credentials?string

Hide schemas you already hold an active credential for: true / false

enable_kyc?string

Only show schemas that require KYC: true / false

date_to?string

End date (YYYY-MM-DD)## Response Body200

List of document schemas

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

items?array<object>

Items on this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

issuer_id?string

Issuer account UUID.

issuer_name?string

Issuer account display name.

document_uid?string

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

mandatory_kyc_file?boolean

Whether a KYC file upload is required when submitting KYC for this schema.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema supports auto-issuance.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Whether claiming this credential is free.

price_usd?number | null

Price in USD when not free (null if free or priced in IDR only).

private_code?string

Code used to reference this schema in Auto Issuance calls when it is not public.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

deleted_at?string | null

Deletion timestamp (null if active).

deleted_by?string | null

Who deleted the schema (null if active).

total?integer

Total number of matching items.

current_page?integer

Current page number.

next_page?integer

Next page number (0 if none).

per_page?integer

Items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-14T10:52:59.285498+07:00",
 "updated_at": "2026-01-14T10:52:59.285498+07:00",
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer_did": "did:eid:example",
 "issuer_name": "example-username",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",

 "description": "Example schema for a basic identity credential",
 "version": 1,
 "category": "identity",

 "default_vc_duration": 30,
 "is_auto_issuance": true,
 "is_public": true,

 "price_usd": null,
 "price_idr": null,
 "private_code": "example-private-code",

 "fullname",
 "phone_number",
 "email",
 "date_of_birth",
 "gender"
 ],
 "deleted_at": null,

 },
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-14T10:52:59.285498+07:00",

 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer_did": "did:eid:example",
 "issuer_name": "example-username",

 "schema_title": "identity-card-v2",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",

 "category": "identity",
 "mandatory_kyc_file": false,
 "default_vc_duration": 30,

 "is_public": true,
 "is_free": true,
 "price_usd": null,
 "price_idr": null,

 "required_fields": [
 "fullname",
 "phone_number",
 "email",
 "date_of_birth",

 ],
 "deleted_at": null,
 "deleted_by": null
 }
 ],
 "total": 2,

 "current_page": 1,
 "next_page": 0,
 "prev_page": 0,

 }
}

---

## Schema Detail

Retrieve one document schema by id , including its full field definitions — use this to know exactly what data to collect before submitting KYC or initiating auto-issuance.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

doc_schema.id from List Document Schemas## Response Body200

Document schema detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

document_uid?string

On-chain document UID.

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

mandatory_kyc_file?boolean

Whether a KYC file upload is required when submitting KYC for this schema.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema supports auto-issuance.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Whether claiming this credential is free.

price_usd?number | null

Price in USD when not free (null if free or priced in IDR only).

private_code?string

Code used to reference this schema in Auto Issuance calls when it is not public.

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

Type.

value?array<unknown>

Array Item

No Description

required?boolean

Whether the field is required.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

created_by?string

DID of the issuer that created the schema.

deleted_by?string | null

Who deleted the schema (null if active).

issuer_id?string

Issuer account UUID.

issuer?object

Issuer that owns this schema.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

client_role?string

Account role (controller for issuers).

is_internal?boolean

Whether this is an internal e.id account.

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

has_token?boolean

Whether the account currently holds an active session token.404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-14T10:52:59.285498+07:00",
 "updated_at": "2026-01-14T10:52:59.285498+07:00",
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",
 "version": 1,

 "mandatory_kyc_file": false,
 "default_vc_duration": 30,
 "is_auto_issuance": true,

 "is_free": true,
 "price_usd": null,
 "price_idr": null,

 "required_fields": [
 "fullname",
 "phone_number",
 "email",
 "date_of_birth",
 "gender"
 ],

 {
 "name": "fullname",
 "type": "string",
 "input": {

 "value": []
 },
 "required": true,
 "description": "Fullname of the claimer"
 },
 {

 "type": "string",
 "input": {
 "type": "number",
 "value": []
 },

 "description": "Phone number of the claimer"
 },
 {
 "name": "email",
 "type": "string",

 "type": "email",
 "value": []
 },
 "required": true,

 },
 {
 "name": "date_of_birth",
 "type": "string",
 "input": {

 "value": []
 },
 "required": true,
 "description": "Date of birth of the claimer"
 },
 {

 "type": "string",
 "input": {
 "type": "dropdown",
 "value": [
 "male",

 ]
 },
 "required": true,
 "description": "Gender of the claimer"
 }
 ],

 "deleted_by": null,
 "issuer": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "is_internal": true,
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 "has_token": true
 }
 }
} Example default {
 "code": 404,
 "message": "document not found",
 "status": false,
 "data": null
}

---

## Validate Issuer App Data

Check whether the identifying data you have (e.g. a certificate/order number and email) matches a record on the issuer's side, before initiating auto-issuance. Returns the matched metadata you can review or prefill.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

private_codestring

doc_schema.private_code from List/Get Document Schema.

identifier_nostring

The identifying number to check on the issuer's side (e.g. certificate/order number).

emailstring

Email to check on the issuer's side.## Response Body200

Validation result

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

valid?boolean

Whether a matching record was found.

metadata?object

Matched data from the issuer's records.

Empty Object

reason?string

Explanation when validation fails; empty on success.

generated_credential_id?string | null

Your own credential id, if the issuer's verify handler returned one (null otherwise).

generated_image_url?string

Preview image generated from the matched data, if applicable.

doc_schema_id?string

Document schema UUID this private_code resolves to.400

Missing required fields

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "valid": true,
 "metadata": {
 "email": "holder@example.com",
 "expired_at": "2030-01-01",
 "fullname": "Jane Doe",
 "identifier_no": "example-identifier-no",
 "image_url": "https://example.com/template.jpg",
 "issued_at": "2026-01-01",
 "subject_id": "00000000-0000-0000-0000-000000000000"
 },

 "generated_credential_id": "example-generated-credential-id",
 "generated_image_url": "https://example.com/credential.jpg",
 "doc_schema_id": "00000000-0000-0000-0000-000000000000"
 }
} Example default {
 "code": 400,
 "message": "email and identifier are required",
 "status": false
}

---

## List Auto Issuance

List your auto-issuance runs with pagination and optional filters — check here if a run seems stuck or you want to confirm a credential was issued.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

status?string

Overall status: started | processing | finished | failed

kyc_status?string

KYC step status: pending | submitted | approved | failed_to_submit | failed_to_approve | failed

doc_schema_id?string

Filter by doc_schema.id## Response Body200

List of auto issuance runs

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

items?array<object>

Items on this page.Array Item

This list view omits retry counts and error/metadata detail — call Get Auto Issuance Detail for the full record.

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

started_at?string

When this run started.

finished_at?string | null

When this run finished (null while in progress).

issuer_account?object | null

Issuer this run targets (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder running this process (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

doc_schema?object | null

Document schema being claimed (null until resolved).Show Attributes

id?string

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

kyc_id?string | null

KYC record UUID once submitted.

kyc_last_try_at?string | null

Last KYC submission attempt timestamp.

kyc_status?string

KYC step status: pending | submitted | approved | failed_to_submit | failed_to_approve | failed.

credential_id?string | null

Issued credential UUID once available.

credential_last_try_at?string | null

Last credential issuance attempt timestamp.

credential_status?string

Credential step status: pending | issued | failed.

status?string

Overall run status: started | processing | finished | failed.

total?integer

Total number of matching items.

total_pages?integer

Total number of pages.

current_page?integer

Current page number.

prev_page?integer

Previous page number (0 if none).

per_page?integer

Items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T04:22:48.6378Z",
 "updated_at": "2026-01-05T04:23:48.820844Z",
 "started_at": "2026-01-05T04:22:48.637598Z",
 "finished_at": null,
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "holder_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"

 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",

 "description": "Example schema for a basic identity credential",
 "category": "identity",
 "required_fields": [
 "fullname",

 "phone_number"
 ]
 },
 "kyc_id": null,
 "kyc_last_try_at": "2026-01-05T04:23:28.811615Z",

 "credential_id": null,
 "credential_last_try_at": null,
 "credential_status": "pending",

 }
 ],
 "total": 1,
 "total_pages": 1,
 "current_page": 1,

 "prev_page": 0,
 "per_page": 10
 }
}

---

## Initiate Auto Issuance

Start an auto-issuance run: send private_code , email , and identifier_no so the issuer can verify you. On success this runs KYC and credential issuance automatically — poll List/Get Auto Issuance to track progress.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

private_codestring

doc_schema.private_code from List/Get Document Schema.

identifier_no?string

Identifying number to verify against the issuer's records (e.g. order/certificate number).

emailstring

Email to verify against the issuer's records.## Response Body201

Auto issuance started

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

started_at?string

When this run started.

finished_at?string | null

When this run finished (null while in progress).

issuer_account?object | null

Issuer this run targets (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder running this process (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

doc_schema?object | null

Document schema being claimed (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

kyc_id?string | null

KYC record UUID once submitted.

kyc_last_try_at?string | null

Last KYC submission attempt timestamp.

kyc_retry_count?integer

Number of KYC submission attempts so far.

kyc_max_retries?integer

Maximum KYC submission attempts allowed.

kyc_status?string

KYC step status: pending | submitted | approved | failed_to_submit | failed_to_approve | failed.

credential_id?string | null

Issued credential UUID once available.

credential_last_try_at?string | null

Last credential issuance attempt timestamp.

credential_retry_count?integer

Number of credential issuance attempts so far.

credential_max_retries?integer

Maximum credential issuance attempts allowed.

credential_status?string

Credential step status: pending | issued | failed.

status?string

Overall run status: started | processing | finished | failed.

error_message?string | null

Error message when status is failed.

error_details?string | null

Additional error detail, if any.

metadata?object

Request data you submitted plus the issuer's verification result, nested under a verification key.

Empty Object

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-26T08:55:23.25049333Z",
 "updated_at": "2026-01-26T08:55:23.25049333Z",
 "started_at": "2026-01-26T08:55:23.249542286Z",
 "finished_at": null,
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "doc_schema": {

 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",

 "category": "identity",
 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]

 "kyc_id": null,
 "kyc_last_try_at": null,
 "kyc_retry_count": 0,

 "kyc_status": "pending",
 "credential_id": null,
 "credential_last_try_at": null,
 "credential_retry_count": 0,

 "credential_status": "pending",
 "status": "started",
 "error_message": null,

 "metadata": {
 "verification": {
 "fullname": "example-fullname"
 }
 }
 }
}

---

## Auto Issuance Detail

Retrieve one auto-issuance run by id , including retry counts and the request/verification metadata — useful for debugging a failed or stuck run.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

auto_issuance.id from List Auto Issuance## Response Body200

Auto issuance detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

started_at?string

When this run started.

finished_at?string | null

When this run finished (null while in progress).

issuer_account?object | null

Issuer this run targets (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder running this process (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

doc_schema?object | null

Document schema being claimed (null until resolved).Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

kyc_id?string | null

KYC record UUID once submitted.

kyc_last_try_at?string | null

Last KYC submission attempt timestamp.

kyc_retry_count?integer

Number of KYC submission attempts so far.

kyc_max_retries?integer

kyc_status?string

KYC step status: pending | submitted | approved | failed_to_submit | failed_to_approve | failed.

credential_id?string | null

Issued credential UUID once available.

credential_last_try_at?string | null

Last credential issuance attempt timestamp.

credential_retry_count?integer

Number of credential issuance attempts so far.

credential_max_retries?integer

Maximum credential issuance attempts allowed.

credential_status?string

Credential step status: pending | issued | failed.

status?string

Overall run status: started | processing | finished | failed.

error_message?string | null

Error message when status is failed.

error_details?string | null

Additional error detail, if any.

metadata?object

Request data you submitted plus the issuer's verification result, nested under a verification key.

Empty Object404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T04:22:48.6378Z",
 "updated_at": "2026-01-05T04:23:48.820844Z",
 "started_at": "2026-01-05T04:22:48.637598Z",
 "finished_at": null,
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "doc_schema": {

 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",

 "category": "identity",
 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]

 "kyc_id": null,
 "kyc_last_try_at": "2026-01-05T04:23:28.811615Z",
 "kyc_retry_count": 3,

 "kyc_status": "failed_to_submit",
 "credential_id": null,
 "credential_last_try_at": null,
 "credential_retry_count": 0,

 "credential_status": "pending",
 "status": "failed",
 "error_message": "KYC processing failed after max retries",

 "metadata": {
 "verification": {
 "dob": "1990-01-01",
 "fullname": "example-fullname",

 "verificator": "example-verificator",
 "identity_number": "example-identity-number"
 }
 }
 }
} Example default {
 "code": 404,
 "message": "auto-issuance not found",
 "status": false,
 "data": null
}

---

## List Credentials

List the verifiable credentials issued to you, with pagination and optional filters.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

sort_order?string

Sort by created_at: asc / desc

status?string

Filter by status: ACTIVE / REVOKED

category?string

Filter by category: identity / asset

schema_name?string

Case-insensitive filter on the credential's schema name

document_uid?string

Filter by document_uid

date_from?string

Start date (YYYY-MM-DD)

date_to?string

End date (YYYY-MM-DD)## Response Body200

List of credentials

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

items?array<object>

Items on this page.Array Item

No Description

id?string

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer that issued the credential.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

status?string

Credential status: ACTIVE / REVOKED.

is_claimed?boolean

is_downloaded?boolean

Whether you have downloaded this credential.

revocation_status?string

Revocation status: none / requested / approved.

revocation_date?string | null

When the credential was revoked (null if not revoked).

digital_asset_url?string | null

URL of the rendered card/certificate image, if the schema generates one.

share_code?string

Code used to share this credential (falls back to the credential id if none was set).

total?integer

Total number of matching items.

total_pages?integer

Total number of pages.

current_page?integer

Current page number.

prev_page?integer

Previous page number (0 if none).

per_page?integer

Items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T02:01:02.496599Z",
 "updated_at": "2026-01-05T03:24:08.870565Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",

 "category": "identity",
 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]

 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "subject_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },

 "expiration_date": "2036-01-03T02:01:02Z",
 "status": "ACTIVE",
 "is_claimed": true,

 "visibility": "private",
 "revocation_status": "none",
 "revocation_date": null,

 "share_code": "example-share-code"
 },
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T02:01:02.496599Z",

 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",

 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",
 "category": "identity",
 "required_fields": [

 "email",
 "phone_number"
 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },

 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "issuance_date": "2026-01-05T02:01:02Z",
 "expiration_date": "2036-01-03T02:01:02Z",

 "is_claimed": true,
 "is_downloaded": false,
 "visibility": "private",
 "revocation_status": "approved",

 "digital_asset_url": "https://example.com/credential-asset.jpg",
 "share_code": "example-share-code"
 }
 ],

 "total_pages": 1,
 "current_page": 1,
 "next_page": 0,

 "per_page": 10
 }
}

---

## Filters - List Issuer

List the distinct issuers behind your credentials — handy for populating an issuer filter dropdown on top of List Credentials.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

List of issuers

code?integer

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?array<object>

Array Item

Issuer account.

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example"
 }
 ]
}

---

## Claim Issued VC

Claim a credential that has been issued to you, recording it against your holder DID so it appears in your wallet.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List/Get Credential## Response Body201

Credential claimed

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

created_at?string

Claim timestamp.

document_uid?string

On-chain document UID.

holder_did?string

Your holder DID.

is_downloaded?boolean

Whether the credential has been downloaded.

is_revoked?boolean

Whether the credential has been revoked.

issuer_did?string

Issuer DID.400

Cannot claim a revoked credential

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Credential successfully claimed",
 "status": true,
 "data": {
 "created_at": "2026-01-31T16:06:20.7185529+07:00",
 "document_uid": "example-document-uid",
 "holder_did": "did:eid:example",
 "is_downloaded": false,
 "is_revoked": false,
 "issuer_did": "did:eid:example"
 }
} Example default {
 "code": 400,
 "message": "cannot claim revoked credential",
 "status": false
}

---

## Credential Detail

Retrieve one credential by id , including revocation data when present.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List Credentials## Response Body200

Credential detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Array Item

No Description

issuer_account?object

Issuer that issued the credential.Show Attributes

id?string

Unique identifier (UUID).

username?string

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

status?string

Credential status: ACTIVE / REVOKED.

is_claimed?boolean

Whether you have claimed this credential.

is_downloaded?boolean

Whether you have downloaded this credential.

revocation_status?string

Revocation status: none / requested / approved.

revocation_date?string | null

When the credential was revoked (null if not revoked).

digital_asset_url?string | null

URL of the rendered card/certificate image, if the schema generates one.

share_code?string

Code used to share this credential (falls back to the credential id if none was set).

gateway_kyc_id?string

Gateway-side KYC record UUID this credential is linked to (all-zero UUID if none).

idchain_kyc_id?string

On-chain KYC reference (empty string if none).

revocation_data?object

Revocation request details.Show Attributes

request_reason?string | null

Reason you gave when requesting revocation.

requested_at?string | null

When revocation was requested.

revoked_reason?string | null

Reason recorded when the issuer approved the revocation.

revoked_at?string | null

When the credential was actually revoked.404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T02:01:02.496599Z",
 "updated_at": "2026-01-05T03:24:08.870565Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",

 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]
 },
 "issuer_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "subject_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "issuance_date": "2026-01-05T02:01:02Z",

 "status": "ACTIVE",
 "is_claimed": true,
 "is_downloaded": false,

 "revocation_status": "none",
 "revocation_date": null,
 "digital_asset_url": "https://example.com/credential-asset.jpg",

 "gateway_kyc_id": "00000000-0000-0000-0000-000000000000",
 "idchain_kyc_id": "00000000-0000-0000-0000-000000000000",
 "revocation_data": {
 "request_reason": null,

 "revoked_reason": null,
 "revoked_at": null
 }
 }
} Example default {
 "code": 404,
 "message": "credential not found",
 "status": false
}

---

## Download VC

Download the full W3C Verifiable Credential JSON for a claimed credential, including its cryptographic proof — this marks the credential as downloaded.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List/Get Credential## Response Body200

Credential downloaded

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

credential?object

The W3C Verifiable Credential (JSON-LD), including its on-chain proof.

Empty Object

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

required_fields?

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer that issued the credential.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

is_claimed?boolean

Whether you have claimed this credential.

is_downloaded?boolean

Whether you have downloaded this credential.

is_revoked?boolean

Whether the credential has been revoked.400

Cannot download a revoked credential

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "credential": {
 "@context": [
 "https://www.w3.org/2018/credentials/v1"
 ],
 "credentialStatus": {
 "id": "urn:eidchain:attestation:example-claim-hash",
 "type": "EidChainRevocation2024"
 },
 "credentialSubject": {
 "_nonce": "example-nonce",
 "claimHash": "example-claim-hash",
 "ctypeHash": "example-document-uid",

 "expired_at": "2031-07-15T16:02:55+07:00",
 "fullname": "Jane Doe",
 "id": "did:eid:example",

 "issued_at": "2026-07-15T16:02:55+07:00",
 "subject_id": "example-subject-id"
 },
 "id": "urn:uuid:00000000-0000-0000-0000-000000000000",

 "issuer": "did:eid:example",
 "proof": {
 "created": "2026-07-15T09:03:30Z",
 "proofPurpose": "assertionMethod",

 "type": "Sr25519Signature2020",
 "verificationMethod": "did:eid:example#example-key-id"
 },
 "type": [
 "VerifiableCredential"
 ]

 "created_at": "2026-01-19T16:47:58.040999+07:00",
 "updated_at": "2026-01-19T16:47:58.05866+07:00",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",

 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",

 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]
 },
 "issuer_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "is_claimed": true,

 "is_revoked": false
 }
} Example default {
 "code": 400,
 "message": "cannot download revoked credential",
 "status": false
}

---

## Update VC Visibility

Set whether a credential is public (discoverable by others) or private .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List/Get Credential
## Request Body

visibilitystring

public or private.## Response Body200

Visibility updated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer that issued the credential.Show Attributes

id?string

Unique identifier (UUID).

username?string

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuance_date?string

Issuance timestamp.

expiration_date?string

Expiration timestamp.

status?string

Credential status: ACTIVE / REVOKED.

is_claimed?boolean

Whether you have claimed this credential.

is_downloaded?boolean

Whether you have downloaded this credential.

revocation_status?string

Revocation status: none / requested / approved.

revocation_date?string | null

When the credential was revoked (null if not revoked).

digital_asset_url?string | null

URL of the rendered card/certificate image, if the schema generates one.

share_code?string

Code used to share this credential (falls back to the credential id if none was set).404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-05T02:01:02.496599Z",
 "updated_at": "2026-01-05T03:24:08.870565Z",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",

 "required_fields": [
 "fullname",
 "email",
 "phone_number"
 ]
 },
 "issuer_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "subject_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "issuance_date": "2026-01-05T02:01:02Z",

 "status": "ACTIVE",
 "is_claimed": true,
 "is_downloaded": false,

 "revocation_status": "none",
 "revocation_date": null,
 "digital_asset_url": "https://example.com/credential-asset.jpg",
 "share_code": "example-share-code"

} Example default {
 "code": 404,
 "message": "Credential not found",
 "status": false
}

---

## Request VC Revocation

Request that the issuer revoke one of your credentials, with a reason — for example when the underlying data is no longer accurate. The issuer must approve the request before the credential is actually revoked.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List/Get Credential
## Request Body

reasonstring

Why you are requesting revocation.## Response Body200

Revocation requested

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

status?string

Credential status: ACTIVE / REVOKED.

revocation_status?string

Revocation status: none / requested / approved.

revocation_data?object

Revocation request details.Show Attributes

request_reason?string | null

Reason you gave when requesting revocation.

requested_at?string | null

When revocation was requested.

revoked_reason?string | null

Reason recorded when the issuer approved the revocation.

revoked_at?string | null

When the credential was actually revoked.400

Already requested or already revoked

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Revocation request submitted successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",
 "category": "identity",
 "required_fields": [
 "fullname",

 "phone_number"
 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "subject_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "status": "REQUEST_REVOKE",
 "revocation_status": "requested",
 "revocation_data": {
 "request_reason": "Data mismatch with authoritative records",

 "revoked_reason": null,
 "revoked_at": null
 }
 }
} Example default {
 "code": 400,
 "message": "Revocation has already been requested for this credential",
 "status": false
}

---

## Cancel VC Revocation

Cancel a revocation request you previously submitted, before the issuer approves it — the credential goes back to ACTIVE . Fails if the credential is already revoked, or if there was no pending revocation request to cancel.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vc.id from List/Get Credential## Response Body200

Revocation canceled

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

doc_schema?object

Document schema this credential was issued from.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

description?string

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

subject_account?object

Holder the credential belongs to.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

status?string

Credential status: ACTIVE / REVOKED.

revocation_status?string

Revocation status: none / requested / approved.

revocation_data?object

Revocation request details.Show Attributes

request_reason?string | null

Reason you gave when requesting revocation.

requested_at?string | null

When revocation was requested.

revoked_reason?string | null

Reason recorded when the issuer approved the revocation.

revoked_at?string | null

When the credential was actually revoked.400

Already revoked or nothing to cancel

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Revocation request canceled successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",
 "schema_name": "identity-card",
 "description": "Example schema for a basic identity credential",
 "category": "identity",
 "required_fields": [
 "fullname",

 "phone_number"
 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "subject_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "status": "ACTIVE",
 "revocation_status": "none",
 "revocation_data": {
 "request_reason": null,

 "revoked_reason": null,
 "revoked_at": null
 }
 }
} Example default {
 "code": 400,
 "message": "Revocation has already been canceled for this credential",
 "status": false
}

---

## Initiate Presentation (Holder-Initiated VP)

Create a holder-initiated VP session for one of your claimed credentials and get back a QR payload for a verifier to scan — the reverse of being scanned by a verifier.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

issuer_credential_idstring

vc.id of the credential you want to present.

presentation_ttl?integer

How long (seconds) the presentation stays available once approved.## Response Body201

Session created

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

VP session UUID.

status?string

Session status.

presentation_ttl?integer

How long (seconds) the approved presentation stays available to the verifier.

qr_data?object

QR payload the verifier's app scans.Show Attributes

challenge?string

Challenge string tied to this session's QR code.

qr_token?string

QR token tied to this session.

expires_at?string

Session expiry timestamp.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "success",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "status": "HOLDER_READY",
 "presentation_ttl": 300,
 "qr_data": {
 "challenge": "example-challenge",
 "qr_token": "example-qr-token"
 },
 "expires_at": "2026-07-17T09:05:52.508635Z"
 }
}

---

## List of VP Session

List Verifiable Presentation (VP) sessions — requests from verifiers asking you to present a credential — with pagination and optional filters.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

status?string

Filter by status: PENDING / WAITING_APPROVAL / REJECTED / APPROVED / EXPIRED / CANCELED

date_from?string

Start date (YYYY-MM-DD)## Response Body200

List of VP sessions

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

items?array<object>

Items on this page.Array Item

No Description

id?string

Unique identifier (UUID).

verification_schema?object

Verification template the verifier is requesting against.Show Attributes

id?string

Unique identifier (UUID).

name?string

Name.

description?string

document_uid?string

On-chain document UID of the expected credential.

custom_webhook_url?string

Per-schema webhook URL override (empty string if unset).

event_type?string

Event type this schema is used for (e.g. VERIFICATION).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

verifier_account?object

Verifier requesting the presentation.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder who scanned/responded (null until scanned).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

On-chain SS58 address.

expires_at?string

Session expiry timestamp.

status?string

Session status: PENDING / WAITING_APPROVAL / REJECTED / APPROVED / EXPIRED / CANCELED.

presentation_ttl?integer

How long (seconds) the approved presentation stays available to the verifier.

reject_reason?string | null

Reason you gave when rejecting (null otherwise).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

total?integer

Total number of matching items.

total_pages?integer

Total number of pages.

current_page?integer

Current page number.

prev_page?integer

Previous page number (0 if none).

per_page?integer

Items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "verification_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "identity-verification-template",
 "description": "Example verification template for basic identity credentials",
 "document_uid": "example-document-uid",
 "custom_webhook_url": "",
 "event_type": "VERIFICATION",

 "updated_at": "2026-01-20T09:36:51.266952+07:00",
 "deleted_at": null
 },
 "verifier_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"

 "holder_account": null,
 "expires_at": "2026-01-20T12:37:02.803493+07:00",
 "status": "REJECTED",

 "reject_reason": "I do not wish to share this information",
 "created_at": "2026-01-20T11:37:02.808072+07:00",
 "updated_at": "2026-01-20T11:37:44.059096+07:00"
 }
 ],

 "total_pages": 6,
 "current_page": 1,
 "next_page": 2,

 "per_page": 1
 }
}

---

## Get VP Session Details

Retrieve one VP session by id , including the QR challenge and qr_token tied to it.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vp_session.id from List VP Session## Response Body200

VP session detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

id?string

Unique identifier (UUID).

verification_schema?object

Verification template the verifier is requesting against.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).

name?string

Name.

description?string

Description.

required_fields?array<string>

Fields the verifier requires from the presented credential.Array Item

No Description

ttl?integer

How long (seconds) a scanned session stays valid before it must be re-scanned.

presentation_limit?integer

Max number of presentations allowed against this schema (0 = unlimited).

custom_webhook_url?string

Per-schema webhook URL override (empty string if unset).

event_type?string

Event type this schema is used for (e.g. VERIFICATION).

issuer_doc_schema?object

Document schema the verifier expects the presented credential to match.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

Type.

value?array<unknown>

Allowed values (e.g. dropdown options).Array Item

No Description

required?boolean

Whether the field is required.

description?string

Description.

required_fields?array<string>

Fields required to claim/present a credential from this schema.Array Item

No Description

issuer?object

Issuer that owns the expected document schema.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

verifier_account?object

Verifier requesting the presentation.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder who scanned/responded (null until scanned).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

expires_at?string

Session expiry timestamp.

status?string

Session status: PENDING / WAITING_APPROVAL / REJECTED / APPROVED / EXPIRED / CANCELED.

presentation_ttl?integer

How long (seconds) the approved presentation stays available to the verifier.

reject_reason?string | null

Reason you gave when rejecting (null otherwise).

scan_logs?array<object>

Log of scan attempts against this session.Array Item

No Description

Empty Object

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

challenge?string

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "verification_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-20T09:33:31.890919+07:00",
 "updated_at": "2026-01-20T09:36:51.266952+07:00",
 "deleted_at": null,
 "name": "identity-verification-template",
 "description": "Example verification template for basic identity credentials",
 "required_fields": [
 "fullname",

 ],
 "ttl": 1,
 "presentation_limit": 0,
 "custom_webhook_url": "",

 "issuer_doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "identity-card-v1",

 "description": "Example schema for a basic identity credential",
 "category": "identity",
 "fields": [
 {

 "type": "string",
 "input": {
 "type": "string",
 "value": []
 },
 "required": true,
 "description": ""
 },
 {
 "name": "email",

 "input": {
 "type": "email",
 "value": []
 },
 "required": true,

 }
 ],
 "required_fields": [
 "fullname",
 "phone_number"
 ],
 "issuer": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 }
 }
 },
 "verifier_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "holder_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "expires_at": "2026-01-20T12:37:02.803493+07:00",
 "status": "REJECTED",
 "presentation_ttl": 0,

 "scan_logs": [],
 "created_at": "2026-01-20T11:37:02.808072+07:00",
 "updated_at": "2026-01-20T11:37:44.059096+07:00",
 "challenge": "example-challenge",

 }
} Example default {
 "code": 404,
 "message": "Session not found: record not found",
 "status": false
}

---

## Get Details (simple)

Retrieve a simplified, minimal view of a VP session by its id — handy for a lightweight confirmation screen before the holder authenticates.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vp_session.id from List VP Session## Response Body200

Simplified VP session

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

Unique identifier (UUID) of the VP session.

event_type?string

Event type of this session (e.g. VERIFICATION).

challenge?string

Challenge string tied to this session's QR code.

qr_token?string

QR token tied to this session.

status?string

Session status: PENDING / WAITING_APPROVAL / REJECTED / APPROVED / EXPIRED / CANCELED.

presentation_ttl?integer

How long (seconds) the approved presentation stays available to the verifier.

reject_reason?string | null

Reason you gave when rejecting (null otherwise).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

verification_schema?object

Verification template the verifier is requesting against.Show Attributes

verification_schema_id?string

Unique identifier (UUID) of the verification schema.

name?string

Name.

description?string

Description.

required_fields?array<string>

Fields the verifier requires from the presented credential.Array Item

No Description

document_schema?object

Document schema the verifier expects the presented credential to match.Show Attributes

document_schema_id?string

Unique identifier (UUID) of the document schema.

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

description?string

Description.

Schema category.

is_free?boolean

Whether claiming this credential is free.

issuer_account?object

Issuer that owns this document schema.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

custom_webhook_url?string

Per-schema webhook URL override (empty string if unset).

event_type?string

Event type this schema is used for (e.g. VERIFICATION).

verifier_account?object

Verifier requesting the presentation.Show Attributes

id?string

Unique identifier (UUID).

username?string

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object | null

Holder who scanned/responded (null until scanned).Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "event_type": "VERIFICATION",
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "expires_at": "2026-01-20T12:37:02.803493+07:00",
 "status": "APPROVED",
 "presentation_ttl": 300,
 "reject_reason": null,
 "created_at": "2026-01-20T11:37:02.808072+07:00",

 "verification_schema": {
 "verification_schema_id": "00000000-0000-0000-0000-000000000000",
 "name": "identity-verification-template",

 "required_fields": [
 "fullname",
 "phone_number"
 ],
 "document_schema": {
 "document_schema_id": "00000000-0000-0000-0000-000000000000",

 "schema_title": "identity-card-v1",
 "description": "Example schema for a basic identity credential",
 "category": "identity",

 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 }
 },
 "custom_webhook_url": "",

 },
 "verifier_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"

 }
}

---

## Approved Requested VP

Approve a scanned VP request, choosing which of your claimed credentials to present and for how long ( presentation_ttl ) it stays available to the verifier.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

session_idstring

VP session UUID from Scan QR for VP.

issuer_credential_idstring

vc.id of the credential you want to present.

presentation_ttl?integer

How long (seconds) the presentation stays available once approved, e.g. 300 = 5 minutes.## Response Body200

Approved

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

status?string

Session status (APPROVED).

updated_at?string

Last update timestamp.500

Already approved

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Verification request approved successfully",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "status": "APPROVED",
 "updated_at": "2026-01-20T11:33:37.0829903+07:00"
 }
} Example default {
 "code": 500,
 "message": "Failed to approve verification: session is already APPROVED",
 "status": false
}

---

## Reject Requested VP

Reject a scanned VP request with a reason.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

session_idstring

VP session UUID from Scan QR for VP.

reasonstring

Why you are rejecting the request.## Response Body200

Rejected

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

VP session UUID.

status?string

Session status (REJECTED).

reason?string

Reason you gave.

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Verification request rejected",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "status": "REJECTED",
 "reason": "I do not wish to share this information",
 "updated_at": "2026-01-20T11:37:44.0590963+07:00"
 }
} Example default {
 "code": 404,
 "message": "Failed to reject verification: session not found: record not found",
 "status": false
}

---

## Rotate QR Token

Refresh the qr_token and challenge of a holder-initiated session — use this if the displayed QR code expires before it is scanned.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

session_idstring

VP session UUID to rotate the QR token for.## Response Body200

QR token rotated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

VP session UUID.

qr_data?object

QR payload the verifier's app scans.Show Attributes

challenge?string

Challenge string tied to this session's QR code.

qr_token?string

QR token tied to this session.

expires_at?string

New session expiry timestamp.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "qr_data": {
 "challenge": "example-challenge",
 "qr_token": "example-qr-token"
 },
 "expires_at": "2026-07-17T09:10:52.508635Z"
 }
}

---

## Scan QR for VP

Holder-side scan of a verifier's QR code. Send the scanned qr_token and challenge ; on success the session moves to WAITING_APPROVAL and you decide to Approve or Reject.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

qr_tokenstring

QR token scanned from the verifier's QR code.

challengestring

Challenge string scanned from the verifier's QR code.## Response Body200

QR valid

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Show Attributes

session_id?string

VP session UUID.

status?string

Session status after scanning.

expires_at?string

Session expiry timestamp.

verifier_account?object

Verifier requesting the presentation.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

verifier_description?string

Description of the verifier's verification template.

verifier_schema_name?string

Name of the verifier's verification template.

verifier_doc_schema_id?string

Issuer document schema UUID the verifier expects.

expected_issuer_doc_uid?string

On-chain document UID of the credential the verifier expects.

issuer_description?string

Description of the expected credential's schema.

issuer_schema_name?string

Name of the expected credential's schema.

required_fields?array<string>

Fields the verifier will see from your credential.Array Item

No Description400

Invalid or expired QR

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "status": "WAITING_APPROVAL",
 "expires_at": "2026-01-04T09:40:38.37823+07:00",
 "verifier_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example"
 },
 "verifier_description": "Example verification template for basic identity credentials",
 "verifier_schema_name": "identity-verification-template",

 "expected_issuer_doc_uid": "example-document-uid",
 "issuer_description": "Example schema for a basic identity credential",
 "issuer_schema_name": "identity-card",

 "fullname",
 "phone_number"
 ]
 }
} Example default {
 "code": 400,
 "message": "Invalid QR code or session: invalid or expired QR token",
 "status": false
}

---


# Verifier API

## Overview

Verify credentials and authenticate holders as a Verifier.

The **Verifier API** lets an organization request and verify credentials that holders present.
As a verifier you can:

- Browse issuer **document schemas** to know which fields a credential exposes.

- Build reusable **verification schemas** describing what you require.

- Create **presentation (VP) requests** and read the presented data.

- Authenticate holders with **Login with VC**.
## How the Verifier flow works

You define what you want to verify once (a verification schema), then create a presentation request
that the holder scans and answers with their credential.

Want to join as a verifier? Start here

**Step 0 — get onboarded.** Contact support to be onboarded and receive your client_id &
 client_secret (see Getting Access). Once you have credentials, follow steps 1–6 below.

- **Authenticate** — call **Authentication → Get Access Token** with your verifier client_id and client_secret to obtain a Bearer token used on every request.

- **Know the data** — browse issuer **Document Schemas** (list & detail) to see which fields a credential exposes.

- **Define what you require** — create a **Verification Schema** listing the credential(s) and required_fields a holder must present.

- **Request a presentation** — call **Presentation → Create VP Request**; you get a QR payload ( challenge , qr_token ) for the holder to scan.

- **Holder presents** — the holder scans the QR in their app and presents the required credential. The **e.id Gateway** also sends a Presentation Webhook to your callback URL on each event (scan / reject / approve).

- **Read the result** — fetch the presented data with **Get VP Result / Session**. Alternatively, use **Login with VC** to authenticate holders directly.
## Base URLs

- 🛠️ Sandbox: https://gateway-sandbox.e.id 

- 🌍 Production: https://gateway.e.id 
## Getting Access

Access to the Verifier API is granted through our support team. Your organization must be onboarded
before you can use the API.

Contact support to get started

To be registered as a Verifier, reach out to **support@corp.e.id**. Once your organization is
approved and onboarded, support will provide the client_id and client_secret you use to
authenticate with the API.
## Authentication

All endpoints require a Bearer token. Call **Authentication → Get Access Token** with the verifier
 client_id and client_secret provided by support, then send the returned token in the
 Authorization header on every request.
## Endpoint guide

Every endpoint, grouped exactly like the sidebar menu and the Postman collection. Each name links to
the full reference with request and response examples you can copy.

Quick answers

- Want to add **"login with e.id credential"** to your app? → Login VC (Static) or Login VC (Schema)

- Want to **verify a customer's credential**? → Create Template once, then each time

- **Waiting for a holder** to answer? → poll VP Session (simple), then read VP Result
### 🔐 Authentication

Gets and manages the Bearer token that secures every other call.

| Endpoint| Method| What it does & when to use it
| Get Access Token| POST| Exchanges your client_id + client_secret for a short-lived Bearer token. **Always your first call.**
| Refresh Token| POST| Gets a new access token from your refresh_token without re-sending credentials. Use when the token expires.
| Logout| POST| Invalidates the current token/session. Use it when rotating credentials or closing a session.
### 🪪 Login with VC

Authenticate users with a verifiable credential instead of a password.

| Endpoint| Method| What it does & when to use it
| Login VC (Static)| POST| Generates a login QR bound to your static EID schema — the fastest way to add "sign in with e.id".
| Login VC (Schema)| POST| Generates a login QR for any verification schema ( verification_id ) — use when signing in requires a specific credential.
### 👤 Profile

Your verifier account and its callback settings.

| Endpoint| Method| What it does & when to use it
| Get Profile| GET| Shows your account: DID, on-chain address and current webhook settings.
| Update Profile| PUT| Sets the default_webhook_url the e.id Gateway calls when a presentation event happens.
### 📄 Document Schema

Read-only view of issuer schemas — check which fields a credential exposes **before** you build a
verification schema.

| Endpoint| Method| What it does & when to use it
| List Schemas| GET| Browses issuer document schemas with pagination and filters.
| Schema Detail| GET| One issuer schema by id , including its full field definitions.
### 📋 Verification Schema

A verification schema is a **reusable template** describing which credential(s) and fields you require
from a holder. Define it once, reuse it for every verification.

| Endpoint| Method| What it does & when to use it
| List Templates| GET| Your templates with pagination and filters.
| Template Detail| GET| One template by id .
| Create Template| POST| Defines the required credential schemas and required_fields ; event_type is VERIFICATION or LOGIN_VC .
| Update Template| PUT| Changes an existing template by id .
| Delete Template| DELETE| Soft-deletes a template you no longer use.
| Restore Template| POST| Brings back a soft-deleted template.
### 📱 Presentation

A presentation (VP) session is **one verification interaction** with a holder — from QR to result.

| Endpoint| Method| What it does & when to use it
| Create VP Request| POST| Starts a verification: returns eid_oauth_url and a QR payload ( challenge , qr_token ) for the holder to scan.
| List VP Sessions| GET| Your session history, filterable by status and template.
| | GET| Everything about one session: schema, holder account and scan logs.
| VP Session (simple)| GET| A lightweight status view — handy for polling while you wait for the holder.
| VP Result| GET| The credential data the holder presented. Only available while the presentation TTL is active — read it promptly.
| Scan Holder QR| POST| The reverse flow: the holder shows a QR and **you** scan it, verifying against your chosen schema.
### 🔔 Event Callbacks

Payloads the **e.id Gateway** sends to **your** callback URL during verification. These are not
endpoints you call — they are the ones the gateway sends you.

| Page| Direction| What it does & when to use it
| Presentation Webhook| Gateway → You| The payload sent to your default_webhook_url on each presentation event (scan / reject / approve). Set the URL in Update Profile.
## Postman Collection

Download Collection
###

---

## Get Access Token

Exchange your verifier client_id and client_secret for a short-lived Bearer access token. Every other Verifier endpoint requires this token in the Authorization: Bearer example-access-token header, so call this first.
## Request Body

client_idstring

Your application client ID.

client_secretstring

Your application client secret.## Response Body200

Access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid credentials

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid credentials",
 "status": false,
 "data": null
}

---

## Refresh Token

Obtain a new access token using a previously issued refresh_token , without re-sending your credentials.
## Request Body

refresh_tokenstring
## Response Body200

New access token generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

expire?string

Token expiry timestamp.

ttl?integer

Token lifetime in seconds.

token?string

Access token (JWT).

token_type?string

Token type (Bearer).

refresh_token?string

Refresh token.

refresh_expires?string

Refresh token expiry timestamp.401

Invalid or expired refresh token

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "expire": "2026-07-18T09:00:00Z",
 "ttl": 3600,
 "token": "example-access-token",
 "token_type": "Bearer",
 "refresh_token": "example-refresh-token",
 "refresh_expires": "2026-07-25T09:00:00Z"
 }
} Example default {
 "code": 401,
 "message": "invalid or expired refresh token",
 "status": false,
 "data": null
}

---

## Logout

Invalidate the current token/session using the Bearer token in the request.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Logged out

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

message?string

Message displayed to the user.401

Unauthorized

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "message": "logged out"
 }
} Example default {
 "code": 401,
 "message": "unauthorized",
 "status": false,
 "data": null
}

---

## Get Profile

Retrieve your verifier account profile, including DID, address, and webhook settings.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body200

Verifier profile

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

username?string

Account display name.

client_id?string

Account client ID.

client_secret?string

Account client secret.

client_role?string

Account role (controller / verifier / claimer).

platform_id?string

Platform UUID.

platform?object

Platform the account belongs to.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

name?string

Name.

address?string

Short account address (without platform suffix).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

developer_key?string | null

Developer key (null if not set).

developer_key_path?string | null

Developer key path (null if not set).

has_token?boolean

Whether the account currently holds a valid token.

rate_limit_per_minute?integer

Allowed requests per minute.

total_failed_request?integer

Number of failed requests.

is_access_locked?boolean

Whether account access is locked.

eidchain_status?string

On-chain registration status.

eidchain_failure_count?integer

On-chain registration failure count.

eidchain_last_retry_at?string

Timestamp of the last on-chain retry.

eidchain_did?string

eidchain_address?string

On-chain SS58 address.

default_webhook_url?string | null

Default webhook URL for events.

default_verify_url?string | null

Default KYC verification callback URL.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "created_at": "2026-07-17T04:35:10.310699Z",
 "updated_at": "2026-07-17T04:35:40.359256Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "client_id": "example-client-id",
 "client_secret": "example-client-secret",
 "client_role": "verifier",
 "is_internal": true,
 "platform_id": "00000000-0000-0000-0000-000000000000",

 "created_at": "2025-12-01T08:45:45.185829Z",
 "updated_at": "2025-12-01T08:45:45.185829Z",
 "id": "00000000-0000-0000-0000-000000000000",

 },
 "address": "example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 "developer_key": null,
 "developer_key_path": null,
 "has_token": true,

 "total_failed_request": 0,
 "is_access_locked": false,
 "eidchain_status": "success",
 "eidchain_failure_count": 0,

 "eidchain_did": "did:eid:example",
 "eidchain_address": "example-onchain-address",
 "default_webhook_url": null,

 }
}

---

## Update Profile

Update your default webhook URL used for presentation events.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

default_webhook_url?string

Your URL that the e.id Gateway POSTs presentation events to (WAITING_APPROVAL / REJECTED / APPROVED).## Response Body200

Profile updated

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

username?string

Account display name.

client_id?string

Account client ID.

client_secret?string

Account client secret.

client_role?string

Account role (controller / verifier / claimer).

platform_id?string

Platform UUID.

platform?object

Platform the account belongs to.Show Attributes

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

id?string

Unique identifier (UUID).

name?string

Name.

address?string

Short account address (without platform suffix).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

developer_key?string | null

Developer key (null if not set).

developer_key_path?string | null

Developer key path (null if not set).

has_token?boolean

Whether the account currently holds a valid token.

rate_limit_per_minute?integer

Allowed requests per minute.

total_failed_request?integer

Number of failed requests.

is_access_locked?boolean

Whether account access is locked.

eidchain_status?string

On-chain registration status.

eidchain_failure_count?integer

On-chain registration failure count.

eidchain_last_retry_at?string

Timestamp of the last on-chain retry.

eidchain_did?string

eidchain_address?string

On-chain SS58 address.

default_webhook_url?string

Default webhook URL for events.

default_verify_url?string | null

Default KYC verification callback URL.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "profile updated successfully",
 "status": true,
 "data": {
 "created_at": "2026-07-17T04:35:10.310699Z",
 "updated_at": "2026-07-17T04:35:40.359256Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "client_id": "example-client-id",
 "client_secret": "example-client-secret",
 "client_role": "verifier",
 "is_internal": true,
 "platform_id": "00000000-0000-0000-0000-000000000000",

 "created_at": "2025-12-01T08:45:45.185829Z",
 "updated_at": "2025-12-01T08:45:45.185829Z",
 "id": "00000000-0000-0000-0000-000000000000",

 },
 "address": "example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 "developer_key": null,
 "developer_key_path": null,
 "has_token": true,

 "total_failed_request": 0,
 "is_access_locked": false,
 "eidchain_status": "success",
 "eidchain_failure_count": 0,

 "eidchain_did": "did:eid:example",
 "eidchain_address": "example-onchain-address",
 "default_webhook_url": "example-webhook-url",

 }
}

---

## List Schemas

Browse issuer document schemas (read-only) so you know which fields a credential exposes before building a verification schema.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

issuer_name?string

Filter by issuer username

schema_name?string

Filter by schema name## Response Body200

List of document schemas

code?integer

Response code.

message?string

Message displayed to the user.

data?object

Response payload.Show Attributes

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

issuer_id?string

Issuer account UUID.

issuer_name?string

Issuer organization name.

document_uid?string

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

mandatory_kyc_file?boolean

Whether a KYC file upload is required.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema auto-issues credentials.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Boolean flag on the schema.

price_usd?string | null

USD amount; null when is_free is true .

private_code?string

Access code for private schemas.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

deleted_at?string | null

Deletion timestamp (null if active).

deleted_by?string | null

DID of who deleted it (null if active).

total?integer

Total number of items (or totals grouping).

current_page?integer

Current page number.

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-16T01:58:35.258029Z",
 "updated_at": "2026-07-16T01:59:30.094953Z",
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer_did": "did:eid:example",
 "issuer_name": "Example Issuer Org",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "description": "Example membership credential schema",
 "version": 1,
 "category": "identity",

 "default_vc_duration": 365,
 "is_auto_issuance": true,
 "is_public": false,

 "price_usd": null,
 "price_idr": null,
 "private_code": "example-private-code",

 "subject_id",
 "fullname",
 "email"
 ],
 "deleted_at": null,
 "deleted_by": null
 }

 "total": 14,
 "total_pages": 3,
 "current_page": 1,
 "next_page": 2,

 "per_page": 5
 }
}

---

## Schema Detail

Retrieve one issuer document schema by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

doc_schema.id## Response Body200

Document schema detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

document_uid?string

On-chain document UID.

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

mandatory_kyc_file?boolean

Whether a KYC file upload is required.

default_vc_duration?integer

Default credential validity in days.

is_auto_issuance?boolean

Whether the schema auto-issues credentials.

is_public?boolean

Whether the schema is publicly listed.

is_free?boolean

Boolean flag on the schema.

price_usd?string | null

USD amount; null when is_free is true .

private_code?string

Access code for private schemas.

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

value?array<unknown>

Allowed values (e.g. dropdown options).Array Item

No Description

required?boolean

Whether the field is required.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

created_by?string

DID of the creator.

deleted_by?string | null

DID of who deleted it (null if active).

issuer_id?string

Issuer account UUID.

issuer?object

Issuer name.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

client_role?string

Account role (controller / verifier / claimer).

is_internal?boolean

Whether the account is internal to the platform.

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

did?string

Decentralized Identifier (DID).

has_token?boolean

Whether the account currently holds a valid token.404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-16T01:58:35.258029Z",
 "updated_at": "2026-07-16T01:59:30.094953Z",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",
 "schema_name": "membership-card",
 "description": "Example membership credential schema",
 "version": 1,
 "category": "identity",

 "default_vc_duration": 365,
 "is_auto_issuance": true,
 "is_public": false,

 "price_usd": null,
 "price_idr": null,
 "private_code": "example-private-code",

 {
 "name": "fullname",
 "type": "string",
 "input": {
 "type": "string",

 },
 "required": true,
 "description": "Fullname of the claimer"
 },
 {
 "name": "email",

 "input": {
 "type": "email",
 "value": []
 },

 "description": "Email address of the claimer"
 }
 ],
 "required_fields": [
 "fullname",
 "email"
 ],

 "deleted_by": null,
 "issuer_id": "00000000-0000-0000-0000-000000000000",
 "issuer": {
 "id": "00000000-0000-0000-0000-000000000000",

 "client_role": "controller",
 "is_internal": true,
 "target_address": "example.e.id",

 "did": "did:eid:example",
 "has_token": true
 }
 }
} Example default {
 "code": 404,
 "message": "document not found",
 "status": false
}

---

## Create Template

Create a verification schema template. Use expected_schemas to require one or more credential schemas (each with its own required_fields ); event_type is VERIFICATION (default) or LOGIN_VC .
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

namestring

Template name.

description?string

Short description of the template.

ttl?integer

Verification session time-to-live, in hours.

expected_schemasarray<object>

The credential schema(s) the holder must present.Array Item

No Description

schema_id?string

Document schema UUID to require.

mandatory?boolean

Whether presenting this credential is mandatory.

required_fields?array<string>

Fields the holder must disclose from this credential.Array Item

No Description

custom_webhook_url?string

Override webhook URL; falls back to the profile default if empty.

event_type?string

Purpose of the schema — VERIFICATION (default) or LOGIN_VC .

Value in "VERIFICATION" | "LOGIN_VC" ## Response Body201

Verification schema created

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

name?string

Name.

description?string

Description.

document_uid?string

On-chain document UID.

custom_webhook_url?string

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).409

Duplicate required fields

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Verification schema created successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "example-verification-template",
 "description": "Example verification template",
 "document_uid": "example-document-uid",
 "custom_webhook_url": "",
 "event_type": "VERIFICATION",
 "created_at": "2026-07-17T08:26:46.020282Z",
 "updated_at": "2026-07-17T08:26:46.020282Z",
 "deleted_at": null

} Example default {
 "code": 409,
 "message": "a verification schema with the same required fields already exists",
 "status": false
}

---

## List Templates

List your verification schema templates — reusable definitions of which credentials and fields you require.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

template_name?string

Filter by template name

issuer_doc_schema_name?string

Filter by issuer schema name## Response Body200

List of verification schemas

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

current_page?integer

Current page number.

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

name?string

Name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

presentation_limit?integer

Maximum number of presentations allowed (0 = unlimited).

issuer_doc_schema?object

Issuer document schema this template targets.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

Description.

category?string

Schema category (identity / asset).

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

verifier_account?object

Verifier account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).

next_page?integer

Next page number (0 if none).

per_page?integer

Number of items per page.

prev_page?integer

Previous page number (0 if none).

total_pages?integer

Total number of pages.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "current_page": 1,
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "membership-card Verification",
 "description": "Example verification schema",
 "required_fields": [
 "identifier_no",
 "email"
 ],
 "ttl": 24,
 "presentation_limit": 0,

 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "description": "Example membership credential schema",
 "category": "identity",
 "required_fields": [
 "subject_id",
 "fullname",

 ]
 },
 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "verifier_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"

 "created_at": "2026-07-15T08:15:26.232577Z",
 "updated_at": "2026-07-15T08:15:26.232577Z",
 "deleted_at": null
 }
 ],

 "per_page": 10,
 "prev_page": 0,
 "total": 1,
 "total_pages": 1

}

---

## Template Detail

Retrieve one verification schema template by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

verification_schema.id## Response Body200

Verification schema detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

ttl?integer

Token lifetime in seconds.

presentation_limit?integer

Maximum number of presentations allowed (0 = unlimited).

custom_webhook_url?string

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

verifier_account?object

Verifier account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

issuer_doc_schema?object

Issuer document schema this template targets.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

Type.

value?array<unknown>

Allowed values (e.g. dropdown options).Array Item

No Description

required?boolean

Whether the field is required.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

issuer?string | null

Issuer name.

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-07-17T08:26:46.020282Z",
 "updated_at": "2026-07-17T08:26:46.020282Z",
 "deleted_at": null,
 "name": "example-verification-template",
 "description": "Example verification template",
 "required_fields": [
 "subject_id",
 "email",
 "phone_number"
 ],

 "presentation_limit": 0,
 "custom_webhook_url": "",
 "event_type": "VERIFICATION",
 "verifier_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 },
 "issuer_doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",

 "schema_name": "membership-card",
 "description": "Example membership credential schema",
 "category": "identity",
 "fields": [

 "name": "subject_id",
 "type": "string",
 "input": {
 "type": "string",

 },
 "required": true,
 "description": "Subject ID of the claimer"
 },
 {
 "name": "email",

 "input": {
 "type": "string",
 "value": []
 },

 "description": "Email address of the claimer"
 },
 {
 "name": "phone_number",
 "type": "string",
 "input": {

 "value": []
 },
 "required": true,
 "description": "Phone number of the claimer"
 }

 "required_fields": [
 "subject_id",
 "email",
 "phone_number"
 ],
 "issuer": null
 },

 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 }
 }
} Example default {
 "code": 404,
 "message": "verifier doc schema not found",
 "status": false
}

---

## Update Template

Update a verification schema template by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

verification_schema.id
## Request Body

namestring

Template name.

description?string

Short description of the template.

ttl?integer

Verification session time-to-live, in hours.

presentation_limit?integer

Max presentations allowed (0 = unlimited).

expected_schemasarray<object>

The credential schema(s) the holder must present.Array Item

No Description

schema_id?string

Document schema UUID to require.

mandatory?boolean

Whether presenting this credential is mandatory.

required_fields?array<string>

Fields the holder must disclose from this credential.Array Item

No Description

custom_webhook_url?string

Override webhook URL; falls back to the profile default if empty.

event_type?string

Purpose of the schema — VERIFICATION (default) or LOGIN_VC .

Value in "VERIFICATION" | "LOGIN_VC" ## Response Body200

Verification schema updated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

name?string

Name.

description?string

Description.

document_uid?string

custom_webhook_url?string

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Verification schema updated successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "example-verification-template",
 "description": "Example verification template",
 "document_uid": "example-document-uid",
 "custom_webhook_url": "example-webhook-url",
 "event_type": "LOGIN_VC",
 "created_at": "2026-07-17T08:26:46.020282Z",
 "updated_at": "2026-07-17T08:28:46.883497Z",
 "deleted_at": null

}

---

## Delete Template

Soft-delete a verification schema template by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

verification_schema.id## Response Body200

Deleted

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

Response payload.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Verification schema deleted successfully",
 "status": true,
 "data": null
}

---

## Restore Template

Restore a previously soft-deleted verification schema template.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

verification_schema.id## Response Body200

Restored

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

name?string

Name.

description?string

Description.

document_uid?string

On-chain document UID.

custom_webhook_url?string

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).500

Already active

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?string | null

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Verification schema restored successfully",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "example-verification-template",
 "description": "Example verification template",
 "document_uid": "example-document-uid",
 "custom_webhook_url": "example-webhook-url",
 "event_type": "LOGIN_VC",
 "created_at": "2026-07-17T08:26:46.020282Z",
 "updated_at": "2026-07-17T08:31:24.372853Z",
 "deleted_at": null

} Example default {
 "code": 500,
 "message": "verification schema is already active",
 "status": false,
 "data": null
}

---

## Login VC (Static)

Generate a login QR bound to your static EID schema. The holder scans it with the e.id app to sign in using their verifiable credential.
## Authorization

AuthorizationBearer <token>

In: header ## Response Body201

Login QR generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

session_id?string

Session UUID.

eid_oauth_url?string

e.id wallet URL the holder opens to authenticate (embeds the challenge and qr_token).

expires_at?string

Expiry timestamp.

status?string

Status of the request (true = success).

qr_data?object

QR payload for the holder to scan.Show Attributes

challenge?string

Verification challenge string.

qr_token?string

QR token for the session.

schema_id?string

Schema UUID.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Verification request created successfully",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "eid_oauth_url": "https://wallet-sandbox.e.id/oauth/credential?c=example-challenge&q=example-qr-token",
 "expires_at": "2026-07-17T09:04:58.718102Z",
 "status": "PENDING",
 "qr_data": {
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "schema_id": "00000000-0000-0000-0000-000000000000",
 "event_type": "LOGIN_VC"
 }

}

---

## Login VC (Schema)

Generate a login QR for any verification schema — pass the verification_id of the schema the holder must present to authenticate.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

verification_idstring
## Response Body201

Login QR generated

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

session_id?string

Session UUID.

eid_oauth_url?string

e.id wallet URL the holder opens to authenticate (embeds the challenge and qr_token).

expires_at?string

Expiry timestamp.

status?string

Status of the request (true = success).

qr_data?object

QR payload for the holder to scan.Show Attributes

challenge?string

Verification challenge string.

qr_token?string

QR token for the session.

schema_id?string

Schema UUID.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Verification request created successfully",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "eid_oauth_url": "https://wallet-sandbox.e.id/oauth/credential?c=example-challenge&q=example-qr-token",
 "expires_at": "2026-07-17T09:04:58.718102Z",
 "status": "PENDING",
 "qr_data": {
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "schema_id": "00000000-0000-0000-0000-000000000000",
 "event_type": "LOGIN_VC"
 }

}

---

## Create VP Request

Create a Verifiable Presentation (VP) request. Returns a QR payload ( challenge , qr_token , schema_id ) for the holder to scan and present the required credential.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

verifier_doc_schema_idstring

Verification schema UUID.

expires_in?integer

Optional. Expiry in minutes.## Response Body201

VP request created

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

session_id?string

Session UUID.

eid_oauth_url?string

e.id wallet URL the holder opens to authenticate (embeds the challenge and qr_token).

expires_at?string

Expiry timestamp.

status?string

Status of the request (true = success).

qr_data?object

QR payload for the holder to scan.Show Attributes

challenge?string

Verification challenge string.

qr_token?string

QR token for the session.

schema_id?string

Schema UUID.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 201,
 "message": "Verification request created successfully",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "eid_oauth_url": "https://wallet-sandbox.e.id/oauth/credential?c=example-challenge&q=example-qr-token",
 "expires_at": "2026-07-18T08:40:50.301989Z",
 "status": "PENDING",
 "qr_data": {
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "schema_id": "00000000-0000-0000-0000-000000000000",
 "event_type": "VERIFICATION"
 }

}

---

## List VP Sessions

List verifiable presentation (VP) sessions with pagination and optional filters (status, template).
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?string

Page number

per_page?string

Items per page

status?string

PENDING | WAITING_APPROVAL | REJECTED | APPROVED | EXPIRED | CANCELED

template_id?string

Filter by verification schema id## Response Body200

List of VP sessions

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

items?array<object>

Array of results for this page.Array Item

No Description

id?string

Unique identifier (UUID).

verification_schema?object

Verification schema template.Show Attributes

id?string

Unique identifier (UUID).

name?string

Name.

description?string

document_uid?string

On-chain document UID.

custom_webhook_url?string | null

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

verifier_account?object

Verifier account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

idchain_address?string

On-chain SS58 address.

holder_account?object

Holder account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

On-chain SS58 address.

expires_at?string

Expiry timestamp.

status?string

Status of the request (true = success).

presentation_ttl?integer

Presentation availability in seconds.

reject_reason?string | null

Rejection reason (null if not rejected).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

total?integer

Total number of items (or totals grouping).

total_pages?integer

Total number of pages.

current_page?integer

Current page number.

prev_page?integer

Previous page number (0 if none).

per_page?integer

Number of items per page.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "items": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "verification_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "name": "example-verification-template",
 "description": "Example verification template",
 "document_uid": "example-document-uid",
 "custom_webhook_url": null,
 "event_type": "VERIFICATION",

 "updated_at": "2026-07-15T08:15:26.232577Z",
 "deleted_at": null
 },
 "verifier_account": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"

 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "idchain_address": "example-onchain-address"
 },
 "expires_at": "2026-07-16T08:40:07.537981Z",
 "status": "SCANNED",

 "reject_reason": null,
 "created_at": "2026-07-16T08:35:07.538752Z",
 "updated_at": "2026-07-16T08:35:20.521744Z"
 }

 "total": 1,
 "total_pages": 1,
 "current_page": 1,
 "next_page": 0,

 "per_page": 10
 }
}

---

## VP Session Detail

Retrieve one VP session by its id , including scan logs and the holder account.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vp_session.id## Response Body200

VP session detail

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

id?string

Unique identifier (UUID).

verification_schema?object

Verification schema template.Show Attributes

id?string

Unique identifier (UUID).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

deleted_at?string | null

Deletion timestamp (null if active).

name?string

Name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

ttl?integer

Token lifetime in seconds.

presentation_limit?integer

Maximum number of presentations allowed (0 = unlimited).

custom_webhook_url?string | null

event_type?string

Event type (VERIFICATION / LOGIN_VC).

issuer_doc_schema?object

Issuer document schema this template targets.Show Attributes

id?string

Unique identifier (UUID).

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

schema_name?string

Schema name.

description?string

Description.

category?string

Schema category (identity / asset).

fields?array<object>

Field definitions of the document schema.Array Item

No Description

name?string

Name.

type?string

Type.

input?object

UI input hint (type + allowed values).Show Attributes

type?string

Type.

value?array<unknown>

Allowed values (e.g. dropdown options).Array Item

No Description

required?boolean

Whether the field is required.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

issuer?object

Issuer name.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

verifier_account?object

Verifier account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?string | null

Holder account.

challenge?string

Verification challenge string.

qr_token?string

QR token for the session.

expires_at?string

Expiry timestamp.

presentation_ttl?integer

Presentation availability in seconds.

reject_reason?string | null

Rejection reason (null if not rejected).

scan_logs?array<unknown>

Scan event logs.Array Item

No Description

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.404

Not found

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "verification_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "created_at": "2026-01-02T07:00:43.242889Z",
 "updated_at": "2026-01-02T07:00:43.242889Z",
 "deleted_at": null,
 "name": "example-verification-template",
 "description": "Example verification template",
 "required_fields": [
 "subject_id",

 "phone_number"
 ],
 "ttl": 1,
 "presentation_limit": 0,
 "custom_webhook_url": null,

 "issuer_doc_schema": {
 "id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",

 "schema_name": "membership-card",
 "description": "Example membership credential schema",
 "category": "identity",
 "fields": [

 "name": "subject_id",
 "type": "string",
 "input": {
 "type": "string",

 },
 "required": true,
 "description": "Subject ID of the claimer"
 },
 {
 "name": "email",

 "input": {
 "type": "string",
 "value": []
 },

 "description": "Email of the claimer"
 },
 {
 "name": "phone_number",
 "type": "string",

 "type": "string",
 "value": []
 },
 "required": true,
 "description": "Phone number of the claimer"

 ],
 "required_fields": [
 "subject_id",
 "email",
 "phone_number"
 ],
 "issuer": {

 "username": "example-username",
 "did": "did:eid:example",
 "target_address": "example.e.id",

 }
 }
 },
 "verifier_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "holder_account": null,

 "qr_token": "example-qr-token",
 "expires_at": "2026-07-17T09:05:52.508635Z",
 "status": "PENDING",

 "reject_reason": null,
 "scan_logs": [],
 "created_at": "2026-07-17T08:04:58.723226Z",
 "updated_at": "2026-07-17T08:05:52.515848Z"
 }
 Example default {
 "code": 404,
 "message": "Session not found: record not found",
 "status": false
}

---

## VP Session (simple)

Retrieve a simplified view of a VP session by its id .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vp_session.id## Response Body200

Simplified VP session

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

session_id?string

Session UUID.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

challenge?string

Verification challenge string.

qr_token?string

QR token for the session.

status?string

Status of the request (true = success).

presentation_ttl?integer

Presentation availability in seconds.

reject_reason?string | null

Rejection reason (null if not rejected).

created_at?string

Creation timestamp.

updated_at?string

Last update timestamp.

verification_schema?object

Verification schema template.Show Attributes

verification_schema_id?string

Unique identifier of the verification schema.

name?string

Name.

description?string

Description.

required_fields?array<string>

Fields required by the schema.Array Item

No Description

document_schema?object

The issuer document schema this verification is based on.Show Attributes

document_schema_id?string

Unique identifier of the document schema.

document_uid?string

On-chain document UID.

schema_title?string

Schema title (name-version).

description?string

Description.

Schema category (identity / asset).

is_free?boolean

Boolean flag on the schema.

issuer_account?object

Issuer account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

custom_webhook_url?string

Custom webhook URL for event callbacks; falls back to the profile default when empty.

event_type?string

Event type (VERIFICATION / LOGIN_VC).

verifier_account?object

Verifier account.Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

holder_account?object

Show Attributes

id?string

Unique identifier (UUID).

username?string

Account display name.

did?string

Decentralized Identifier (DID).

target_address?string

Account target address (address.platform).

idchain_address?string

On-chain SS58 address.

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "session_id": "00000000-0000-0000-0000-000000000000",
 "event_type": "VERIFICATION",
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "expires_at": "2026-07-17T10:12:44.021814Z",
 "status": "APPROVED",
 "presentation_ttl": 300,
 "reject_reason": null,
 "created_at": "2026-07-17T09:12:44.024301Z",

 "verification_schema": {
 "verification_schema_id": "00000000-0000-0000-0000-000000000000",
 "name": "example-verification-template",

 "required_fields": [
 "subject_id",
 "email"
 ],
 "document_schema": {
 "document_schema_id": "00000000-0000-0000-0000-000000000000",

 "schema_title": "membership-card-v1",
 "description": "",
 "category": "identity",

 "issuer_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 }
 },
 "custom_webhook_url": "",

 },
 "verifier_account": {
 "id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 },
 "holder_account": {
 "id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address"
 }

}

---

## VP Result

Retrieve the credential(s) the holder presented for an approved session. Only available while the presentation TTL is active.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

vp_session.id## Response Body200

VP result

code?integer

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

holder_did?string

Holder DID.

presentation?object

The presented credential.Show Attributes

credentialStatus?object

Revocation status reference for the credential.Show Attributes

id?string

Unique identifier (UUID).

type?string

Type.

credentialSubject?object

Claims contained in the credential.Show Attributes

email?string

Email address.

subject_id?string

Subject identifier.

id?string

Unique identifier (UUID).

issuanceDate?string

Date the credential was issued.

issuer?string

Issuer name.

type?array<string>

Type.Array Item

No Description

retrieved_at?string

Timestamp when the presentation was retrieved.

session_id?string

Session UUID.

status?string

Status of the request (true = success).404

Not found or expired

code?integer

Response code.

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "success",
 "status": true,
 "data": {
 "holder_did": "did:eid:example",
 "presentation": {
 "credentialStatus": {
 "id": "urn:eidchain:attestation:0x0000000000000000000000000000000000000000000000000000000000000000",
 "type": "EidChainRevocation2024"
 },
 "credentialSubject": {
 "email": "user@example.com",
 "subject_id": "00000000-0000-0000-0000-000000000000"
 },
 "id": "urn:uuid:00000000-0000-0000-0000-000000000000",

 "issuer": "did:eid:example",
 "type": [
 "VerifiableCredential"
 ]
 },
 "retrieved_at": "2026-07-17T09:15:30.874877896Z",

 "status": "APPROVED"
 }
} Example default {
 "code": 404,
 "message": "Presentation data not found or expired",
 "status": false
}

---

## Scan Holder QR

Verifier-initiated scan of a holder's QR code. Provide the holder's qr_token and challenge plus your chosen verifier_doc_schema_id to verify the presentation.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

qr_tokenstring

challengestring

verifier_doc_schema_idstring
## Response Body200

Presentation verified

code?integer

message?string

Message displayed to the user.

status?boolean

Status of the request (true = success).

data?object

Response payload.Show Attributes

holder_did?string

Holder DID.

presentation?object

The presented credential.Show Attributes

credentialStatus?object

Revocation status reference for the credential.Show Attributes

id?string

Unique identifier (UUID).

type?string

Type.

credentialSubject?object

Claims contained in the credential.Show Attributes

email?string

Email address.

subject_id?string

Subject identifier.

id?string

Unique identifier (UUID).

issuanceDate?string

Date the credential was issued.

issuer?string

Issuer name.

type?array<string>

Type.Array Item

No Description

retrieved_at?string

Timestamp when the presentation was retrieved.

session_id?string

Session UUID.

status?string

Status of the request (true = success).

cURLJavaScriptGoPythonJavaC#Example default{
 "code": 200,
 "message": "Presentation verified successfully",
 "status": true,
 "data": {
 "holder_did": "did:eid:example",
 "presentation": {
 "credentialStatus": {
 "id": "urn:eidchain:attestation:0x0000000000000000000000000000000000000000000000000000000000000000",
 "type": "EidChainRevocation2024"
 },
 "credentialSubject": {
 "email": "user@example.com",
 "subject_id": "00000000-0000-0000-0000-000000000000"
 },
 "id": "urn:uuid:00000000-0000-0000-0000-000000000000",

 "issuer": "did:eid:example",
 "type": [
 "VerifiableCredential"
 ]
 },
 "retrieved_at": "2026-07-17T09:15:30.874877896Z",

 "status": "SCANNED"
 }
}

---

## Presentation Webhook

Payloads the e.id Gateway sends to your webhook when a holder scans, rejects, or approves.

When a holder interacts with a verification / Login-with-VC request, the **e.id Gateway** sends a **POST** request to
your webhook URL (set via **Profile → Update Profile**, field default_webhook_url ). Use it to react
in real time instead of polling.

The payload shape is the same for every event — the ** status ** field tells you what happened:

| status | When it fires| reject_reason | presentation_ttl 
| WAITING_APPROVAL | Holder scanned the QR| null | 0 
| REJECTED | Holder declined to share| reason string| 0 
| APPROVED | Holder approved| null | ≥ 300 (seconds)

Placeholder data

All identifiers below ( did:eid:example , example-onchain-address , all-zero UUIDs, …) are
placeholders. Real callbacks contain your actual account/holder data.
## 1. Holder scans the QR — WAITING_APPROVAL 
{
 "event_type": "LOGIN_VC",
 "session_id": "00000000-0000-0000-0000-000000000000",
 "challenge": "example-challenge",
 "qr_token": "example-qr-token",
 "expires_at": "2026-07-20T12:18:50Z",
 "status": "WAITING_APPROVAL",
 "presentation_ttl": 0,
 "reject_reason": null,
 "created_at": "2026-07-20T10:59:42Z",
 "updated_at": "2026-07-20T11:28:47Z",

 "verification_schema_id": "00000000-0000-0000-0000-000000000000",
 "name": "Example Verification Template",
 "description": "Example verification schema",

 "document_schema": {
 "document_schema_id": "00000000-0000-0000-0000-000000000000",
 "document_uid": "example-document-uid",
 "schema_title": "membership-card-v1",

 "category": "identity",
 "issuer_account": {
 "account_id": "00000000-0000-0000-0000-000000000000",

 "did": "did:eid:example",
 "client_role": "controller",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 }
 }
 },
 "verifier_account": {
 "account_id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",

 "client_role": "verifier",
 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",

 },
 "holder_account": {
 "account_id": "00000000-0000-0000-0000-000000000000",
 "username": "example-username",
 "did": "did:eid:example",

 "target_address": "example.e.id",
 "idchain_address": "example-onchain-address",
 "is_internal": true
 }
## 2. Holder rejects — REJECTED 

Same payload as above, with these fields changed:
{
 "status": "REJECTED",
 "reject_reason": "I do not wish to share this information",
 "presentation_ttl": 0
}
## 3. Holder approves — APPROVED 

Same payload, with these fields changed. After this, fetch the credential data with
**Presentation → Get VP Result** while presentation_ttl is still active.
{
 "status": "APPROVED",
 "reject_reason": null,
 "presentation_ttl": 300
}
## Field reference

| Field| Description
| event_type | LOGIN_VC (auth using VC) or VERIFICATION (standard VP request).
| session_id | The VP session id — match it to the session you created.
| challenge · qr_token | The QR payload the holder scanned.
| status | WAITING_APPROVAL · REJECTED · APPROVED .
| presentation_ttl | Seconds the presented data stays retrievable (only > 0 when APPROVED ).
| reject_reason | Filled only when REJECTED .
| verification_schema | The schema requested, including its document_schema and issuer_account .
| verifier_account | Your verifier account.
| holder_account | The holder who scanned.
###

---


# KYC Gateway API

## Overview

Run KYC (Privy, Privy Digital ID, Vida) through one multi-tenant gateway.

The **KYC Gateway** is a multi-tenant service that runs identity verification through
**Privy**, **Privy Digital ID** (PrivyPass), and **Vida** behind one consistent API. As a tenant you can:

- Run KYC through any of the three providers with the **same request and webhook shape**.

- Receive the outcome as a **webhook** at your callback_url , then fetch the full **decrypted transaction detail**.

- Check whether a **NIK is already registered** (duplicate detection).

- Track your **billing usage**.
## How the KYC flow works

You initiate a KYC for a provider, redirect the user to the returned URL to complete it, receive a
webhook when it finishes, and fetch the full detail afterward.

Want to integrate KYC? Start here

**Step 0 — get onboarded.** Contact support to receive your ** client_id ** and ** api_secret **
(see Getting Access). You sign every request with them (see
Authentication); there is no client_id in the request body. Once you have them,
follow steps 1–5 below.

- **Get your credentials** — get onboarded via support to receive your client_id and api_secret , then sign every request with them (see Authentication).

- **Initiate a KYC** — call **Initiate KYC** in the provider's folder (Privy · Privy Digital ID · Vida) with a unique reference_id , your callback_url , and email (plus phone for Vida). You receive a redirect_url .

- **User completes KYC** — send the user to redirect_url (Privy hosted page, PrivyPass QR/deeplink, or the Vida microsite) where they finish verification. They complete it on the provider's side — there is **no redirect back** to your app; you learn the outcome from the webhook (step 4).

- **Receive the webhook** — when the flow finishes, the gateway POSTs the result to your callback_url — the same payload for every provider (see Event Callbacks). Use **Webhook → Validate / Resend** to inspect or replay a delivery.

- **Fetch details & monitor** — call **Get Transaction Details** in the provider's folder (Privy · Privy Digital ID · Vida) for the full decrypted audit trail, check duplicates with Check NIK, and track spend with Billing Usage.

Provider-specific follow-ups

The flow above is the same for all providers. Two providers add a follow-up: **Privy Digital ID**
resolves identity via Get Shared Data after the user
approves, and **Privy (classic)** can be polled with .
For **Vida**, the microsite at redirect_url handles OCR + liveness automatically.
## Base URLs

- 🛠️ Sandbox: https://api-kyc.sandbox.e.id 

- 🌍 Production: https://api.kyc.e.id 
## Getting Access

Access to the KYC Gateway is granted through our support team.

Contact support to get started

To be registered, reach out to **support@corp.e.id**. Once approved and onboarded, support will
provide your client_id and a base64 api_secret . The secret is shown once — store it securely.
You use them to sign your requests (see Authentication).
## Authentication

Every request is authenticated with **HMAC request signing**. You never send your api_secret — you
sign each request with it and send four headers:

| Header| Value
| X-Client-Id | Your client_id .
| X-Timestamp | Current Unix time in seconds. Must be within 5 minutes of the server clock.
| X-Nonce | A unique value per request (e.g. a UUID). Reusing one is rejected as a replay.
| X-Signature | Hex HMAC-SHA256 of the canonical string below, keyed by your base64-decoded api_secret .

The canonical string is these five lines, joined by a newline ( \n ):
<HTTP METHOD>
<request path, e.g. /api/v1/kyc/initiate>
<X-Timestamp>
<X-Nonce>
<SHA-256 hex of the raw request body>

The Postman collection does all of this for you: set client_id and
 api_secret , and its pre-request script signs every request automatically.
### Building the signature

Any language works — you only need SHA-256, HMAC-SHA256, and base64. Each snippet builds the four
headers for a single request: pass your client_id , your base64 api_secret , the request method 
and path , and the raw JSON body (use an empty string for GET). The signature is **lowercase hex**.
import crypto from "node:crypto";

function signHeaders({ clientId, apiSecret, method, path, body = "" }) {
 const timestamp = Math.floor(Date.now() / 1000).toString();

 const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
 const canonical = [method, path, timestamp, nonce, bodyHash].join("\n");
 const key = Buffer.from(apiSecret, "base64");
 const signature = crypto.createHmac("sha256", key).update(canonical).digest("hex");
 return {
 "X-Client-Id": clientId,
 "X-Timestamp": timestamp,
 "X-Nonce": nonce,
 "X-Signature": signature,
 };
}

// GET has an empty body:

 clientId: "your-client-id",
 apiSecret: "your-base64-api-secret",
 method: "GET",
 path: "/api/v1/kyc/transactions",
});
package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex
	"strconv"
	"time"
)

func signHeaders(clientID, apiSecret, method, path, body string) (map[string]string, error) {
	secret, err := base64.StdEncoding.DecodeString(apiSecret)
	if err != nil {
		return nil, err
	}
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	nb := make([]byte, 16)
	if _, err := rand.Read(nb); err != nil {
		return nil, err
	}
	nonce := hex.EncodeToString(nb)

	sum := sha256.Sum256([]byte(body))
	canonical := method + "\n" + path + "\n" + timestamp + "\n" + nonce + "\n" + hex.EncodeToString(sum[:])

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(canonical))
	signature := hex.EncodeToString(mac.Sum(nil))

	return map[string]string{
		"X-Client-Id": clientID,
		"X-Timestamp": timestamp,
		"X-Nonce": nonce,
		"X-Signature": signature,
	}, nil
}
import base64, hashlib, hmac, time, uuid

def sign_headers(client_id: str, api_secret: str, method: str, path: str, body: str = "") -> dict:
 timestamp = str(int(time.time()))

 body_hash = hashlib.sha256(body.encode()).hexdigest()
 canonical = "\n".join([method, path, timestamp, nonce, body_hash])
 key = base64.b64decode(api_secret)
 signature = hmac.new(key, canonical.encode(), hashlib.sha256).hexdigest()
 return {
 "X-Client-Id": client_id,
 "X-Timestamp": timestamp,
 "X-Nonce": nonce,

 }
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

static Map<String, String> signHeaders(String clientId, String apiSecret,
 String method, String path, String body) throws Exception {
 String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
 String nonce = UUID.randomUUID().toString();

 byte[] bodyDigest = MessageDigest.getInstance("SHA-256")
 .digest(body.getBytes(StandardCharsets.UTF_8));
 String bodyHash = HexFormat.of().formatHex(bodyDigest);

 String canonical = String.join("\n", method, path, timestamp, nonce, bodyHash);

 Mac mac = Mac.getInstance("HmacSHA256");
 mac.init(new SecretKeySpec(Base64.getDecoder().decode(apiSecret), "HmacSHA256"));
 String signature = HexFormat.of()
 .formatHex(mac.doFinal(canonical.getBytes(StandardCharsets.UTF_8)));

 return Map.of(
 "X-Client-Id", clientId,
 "X-Timestamp", timestamp,
 "X-Nonce", nonce,
 "X-Signature", signature
 );
}
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

static Dictionary<string, stringSignHeaders(
 string clientId, string apiSecret, string method, string path, string body = "")
{
 var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
 var nonce = Guid.NewGuid().ToString();

 var bodyHash = Convert.ToHexString(
 SHA256.HashData(Encoding.UTF8.GetBytes(body))).ToLowerInvariant();

 var canonical = string.Join("\n", method, path, timestamp, nonce, bodyHash);

 using var hmac = new HMACSHA256(Convert.FromBase64String(apiSecret));
 var signature = Convert.ToHexString(
 hmac.ComputeHash(Encoding.UTF8.GetBytes(canonical))).ToLowerInvariant();

 return new Dictionary<string, string>
 {
 ["X-Client-Id"] = clientId,
 ["X-Timestamp"] = timestamp,
 ["X-Nonce"] = nonce,

 };
}
## Endpoint guide

Every endpoint, grouped exactly like the sidebar menu and the Postman collection. Each name links to
the full reference with request and response examples you can copy.

Quick answers

- Want to **start a KYC**? → Initiate KYC — Privy · Privy Digital ID · Vida

- Did the user **finish**? → the webhook at your callback_url (Success / Rejected), or Get Transaction Details (Privy · Privy Digital ID · Vida)

- Is this **NIK already used under your tenant**? → Check NIK Exists

- **Webhook missed** by your server? → Resend Webhook
### 🧩 General

Cross-provider endpoints used by every integration.

| Endpoint| Method| What it does & when to use it
| List KYC Transactions| GET| Your transactions, newest first (records only) — paginated.
| Check NIK Exists| GET| Reports whether a NIK is already registered **under your tenant** (per-tenant only — not across other tenants).
| Get Billing Usage| GET| Billing totals (in UNIT).
### 🟣 Privy

Classic Privy (email-registration) flow. **Initiate** and **Get Transaction Details** live here too.

| Endpoint| Method| What it does & when to use it
| Initiate KYC — Privy| POST| Starts a Privy KYC; returns a redirect_url (hosted registration page).
| Privy Check Status| GET| Polls Privy and syncs the transaction; fires your webhook if the status changed.
| Privy Usage| GET| Call-level activity log for Privy actions.
| Get Transaction Details| GET| Full decrypted detail — the privy response shape.
### 🔵 Privy Digital ID

PrivyPass QR/consent flow — a separate product from classic Privy.

| Endpoint| Method| What it does & when to use it
| Initiate KYC — Privy Digital ID| POST| Starts a Digital ID KYC; returns a QR / deeplink redirect_url .
| | GET| Fetches & RSA-decrypts shared identity — user_data + ktp_data (NIK, name, dob, KTP/selfie URLs); runs the NIK-dedup check.
| Get Identity Data| GET| Basic profile ( privy_id , name, email, phone) — no NIK. A lightweight token/login check.
| Confirm Callback| POST| Manually re-sends the merchant→Privy acknowledgement if the automatic one failed.
| Privy Digital ID Usage| GET| Per-call billing audit trail for Digital ID API calls.
| Get Transaction Details| GET| Full decrypted detail — the privy_digitalid response shape.
### 🟢 Vida

Vida flow. For most cases just redirect to the redirect_url and let the microsite handle it.

| Endpoint| Method| What it does & when to use it
| Initiate KYC — Vida| POST| Starts a Vida KYC (needs phone ); returns the Vida microsite redirect_url .
| Vida Usage| GET| Call-level activity log for Vida actions.
| Get Transaction Details| GET| Full decrypted detail — the ocr + liveness + fraud response shape.
### 🔁 Webhook

Inspect and replay the webhook deliveries the gateway sends to your callback_url .

| Endpoint| Method| What it does & when to use it
| Validate Webhook| POST| Looks up the most recent webhook log for a transaction (by transaction_id and/or reference_id ).
| Resend Webhook| POST| Re-sends the last webhook delivery, byte-for-byte, to your callback URL.
### 🔔 Event Callbacks

Payloads the gateway sends **to you** at your callback_url . These are not endpoints you call — they
are what your server receives.

| Page| Direction| What it does & when to use it
| KYC Success Webhook| Gateway → You| The payload delivered when a KYC completes successfully ( {nik, fullname, dob} ).
| KYC Rejected Webhook| Gateway → You| The payload delivered when a KYC is rejected, with reject_reason .
## Postman Collection

Download Collection
###

---

## Check NIK Exists

Reports whether the NIK you pass ( gov_id ) is **already registered under your own tenant** — i.e. whether it already has an active, verified KYC that belongs to you. **The check is scoped to your tenant only; it does not look across other tenants.** It's the same per-tenant nik_registry lookup that rejects a Vida verify with VERIFICATION.NIK_ALREADY_REGISTERED . A row matches only if status=success , is_verified=true , and verified_date is within the 2-year PSRE validity window. Dates are WIB (UTC+7). If no match: data is { "exists": false } .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

gov_idstring

The NIK to check, plaintext.## Response Body200

Success

status?string

data?object

Show Attributes

created_at?string

exists?boolean

is_verified?boolean

kyc_transaction_id?string

nik?string

source?string

status?string

verified_date?string

cURLJavaScriptGoPythonJavaC#Example match{
 "status": "success",
 "data": {
 "created_at": "2026-07-16T10:57:25+07:00",
 "exists": true,
 "is_verified": true,
 "kyc_transaction_id": "00000000-0000-0000-0000-000000000000",
 "nik": "3200000000000000",
 "source": "privy",
 "status": "success",
 "verified_date": "2026-07-16T10:57:25+07:00"
 }
} Example no_match {
 "status": "success",
 "data": {
 "exists": false
 }
}

---

## List KYC Transactions

Lists KYC transactions for your tenant, newest first (transaction records only, no OCR/liveness/fraud payloads). Use **Get Transaction Details** for the full decrypted audit trail.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

page?string

Page number, 1-indexed (default 1).

limit?string

Rows per page (default 20, max 100).## Response Body200

Success

status?string

data?array<object>

Array Item

No Description

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

pagination?object

Show Attributes

current_page?integer

next_page?string

prev_page?string

total_page?integer

total?integer

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id-2",
 "provider": "privy",
 "action_type": "register",
 "status": "success",
 "billing_cost": 1,
 "provider_ref_id": "example-reference-number",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",

 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:05:00Z"
 },
 {
 "id": "00000000-0000-0000-0000-000000000000",

 "reference_id": "example-reference-id",
 "provider": "privy",
 "action_type": "register",

 "billing_cost": 1,
 "provider_ref_id": "example-reference-number",
 "callback_url": "https://your-app.example.com/kyc-callback",

 "phone": "",
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:05:00Z"
 }
 ],

 "current_page": 1,
 "next_page": null,
 "prev_page": null,
 "total_page": 1,

 }
}

---

## Get Billing Usage

Returns your billing totals (in UNIT): billing_cost_units (total from your successful KYC transactions) and privy_digitalid_call_cost_units (total from Digital ID API calls). Use it to reconcile your usage.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Response Body200

Success

status?string

data?object

Show Attributes

client_id?string

billing_cost_units?integer

privy_digitalid_call_cost_units?integer

currency?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "client_id": "example-client-id",
 "billing_cost_units": 128,
 "privy_digitalid_call_cost_units": 14,
 "currency": "UNIT"
 }
}

---

## Initiate KYC — Privy

Starts a KYC transaction with the **Privy** provider and returns a redirect_url the user opens to complete verification. Requests are authenticated with signed X-Client-Id headers (see the Overview); there is no client_id in the body.

- provider is privy ; the redirect_url is the Privy hosted registration page. Required: reference_id , provider , callback_url , email .

- reference_id is a unique code **you generate** for each transaction — it must not be the same as a previous one.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

reference_id?string

provider?string

callback_url?string

email?string
## Response Body200

Success

status?string

data?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

redirect_url?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy",
 "action_type": "initiate",
 "status": "pending",
 "billing_cost": 1,
 "provider_ref_id": "",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",
 "phone": "",

 "updated_at": "2026-06-15T07:05:00Z",
 "redirect_url": "https://example.com/register?token=example-token"
 }
}

---

## Privy Check Status

Polls Privy's status API and syncs the result to the local transaction. Also dispatches the tenant webhook if the status changed to success or rejected.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

transaction_idstring

UUID from /initiate response.## Response Body200

Success

status?string

data?object

Show Attributes

channel_id?string

email?string

identity?object

Show Attributes

nama?string

nik?string

tanggalLahir?string

phone?string

privy_id?string

reference_number?string

register_token?string

status?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "channel_id": "example-channel",
 "email": "testuser@example.com",
 "identity": {
 "nama": "John Doe",
 "nik": "3200000000000000",
 "tanggalLahir": "1990-01-01"
 },
 "phone": "+628123456789",
 "privy_id": "example-privy-id",
 "reference_number": "example-reference-number",
 "register_token": "example-token",
 "status": "registered"
 }
}

---

## Get Transaction Details

Returns the full audit detail for a **Privy** KYC transaction, decrypted server-side. A transaction that isn't yours returns 404 .

The response carries a privy block (registration status/URL) alongside transaction , identity , and reject_reason .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Path Parameters

idstring

Transaction UUID.## Response Body200

Success

status?string

data?object

Show Attributes

transaction?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

privy?object

Show Attributes

id?string

kyc_transaction_id?string

reference_number?string

register_token?string

status?string

registration_url?string

description?string

created_at?string

updated_at?string

identity?object

Show Attributes

nik?string

fullname?string

dob?string

reject_reason?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "transaction": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy",
 "action_type": "register",
 "status": "success",
 "billing_cost": 1,
 "provider_ref_id": "example-reference-number",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",

 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:05:00Z"
 },
 "privy": {

 "kyc_transaction_id": "00000000-0000-0000-0000-000000000000",
 "reference_number": "example-reference-number",
 "register_token": "example-register-token",

 "registration_url": "https://example.com/register?token=example-token",
 "description": null,
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:04:00Z"

 "identity": {
 "nik": "3200000000000000",
 "fullname": "John Doe",
 "dob": "1990-01-01"
 },

 }
}

---

## Privy Usage

Lists paginated, call-level activity-log rows for every Privy action (initiate, register, check_status, callback, webhook_dispatch) — a per-call audit trail for the transaction. details holds the provider's raw response as a JSON string when logged (e.g. a status poll); it may be null .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

page?string

limit?string

status?string

Optional exact status filter.## Response Body200

Success

status?string

data?array<object>

Array Item

No Description

created_at?string

updated_at?string

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

details?string

pagination?object

Show Attributes

current_page?integer

next_page?string

prev_page?string

total_page?integer

total?integer

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": [
 {
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:00:00Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy",
 "action_type": "check_status",
 "status": "success",
 "cost": 0,
 "details": "{\"data\": {\"email\": \"testuser@example.com\", \"phone\": null, \"status\": \"pending\", \"identity\": {\"nik\": null, \"nama\": null, \"tanggalLahir\": null}, \"privy_id\": \"\", \"channel_id\": \"example-channel\", \"register_token\": xample-token\", \"reference_number\": \"example-reference-number\"}, \"message\": \"Success retrieve data}"
 },
 {
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:00:00Z",
 "id": "00000000-0000-0000-0000-000000000000",

 "reference_id": "example-reference-id",
 "provider": "privy",
 "action_type": "initiate",

 "cost": 1,
 "details": null
 }
 ],
 "pagination": {

 "next_page": null,
 "prev_page": null,
 "total_page": 1,
 "total": 2

}

---

## Initiate KYC — Privy Digital ID

Starts a KYC transaction with the **Privy Digital ID** provider and returns a redirect_url the user opens to complete verification. Requests are authenticated with signed X-Client-Id headers (see the Overview); there is no client_id in the body.

- provider is privy_digitalid ; the redirect_url is a PrivyPass QR / deeplink. Required: reference_id , provider , callback_url , email . Identity is resolved afterward via Get Shared Data.

- reference_id is a unique code **you generate** for each transaction — it must not be the same as a previous one.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

reference_id?string

provider?string

callback_url?string

email?string
## Response Body200

Success

status?string

data?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

redirect_url?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy_digitalid",
 "action_type": "initiate",
 "status": "pending",
 "billing_cost": 1,
 "provider_ref_id": "",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",
 "phone": "",

 "updated_at": "2026-06-15T07:05:00Z",
 "redirect_url": "https://stg-oauth2.privypass.id/digitalid/landing?client_id=...&csrf=...&is_embed=true&request_id=..."
 }
}

---

## Confirm Callback (manual)

Manually (re-)sends the merchant→Privy acknowledgement for this transaction's session. This normally fires automatically after the Privy callback is processed — use this if that automatic ack failed. status is SUCCESS or REJECTED .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

transaction_id?string

status?string
## Response Body200

Success

status?string

data?object

Show Attributes

code?integer

data?object

Show Attributes

status?string

unique_identifier?string

entity?string

message?string

state?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "code": 200,
 "data": {
 "status": "SUCCESS",
 "unique_identifier": "example-request-id"
 },
 "entity": "CallbackMerchant",
 "message": "Callback Merchant Confirmation Success",
 "state": "CallbackMerchantSUCCESS",
 "status": "SUCCESS"
 }
}

---

## Get Identity Data

Fetches basic, unencrypted profile data ( privy_id , name, email, phone) — no NIK/KTP fields. Useful as a lightweight token-validation / login check when you only need to confirm the user, not their full identity.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

transaction_idstring

UUID from /initiate response.## Response Body200

Success

status?string

data?object

Show Attributes

email?string

name?string

phone?string

privy_id?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "email": "testuser@example.com",
 "name": "John Doe",
 "phone": "+628123456789",
 "privy_id": "example-privy-id"
 }
}

---

## Get Transaction Details

Returns the full audit detail for a **Privy Digital ID** KYC transaction, decrypted server-side. A transaction that isn't yours returns 404 .

The response carries a privy_digitalid block (session / deeplink / status) alongside transaction , identity , and reject_reason .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Path Parameters

idstring

Transaction UUID.## Response Body200

Success

status?string

data?object

Show Attributes

transaction?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

privy_digitalid?object

Show Attributes

created_at?string

updated_at?string

id?string

kyc_transaction_id?string

request_id?string

application_id?string

status?string

privy_id?string

token_expires_at?string

deeplink?string

landing_url?string

waiting_url?string

session_expired_at?string

identity?object

Show Attributes

nik?string

fullname?string

dob?string

reject_reason?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "transaction": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy_digitalid",
 "action_type": "verify",
 "status": "success",
 "billing_cost": 1,
 "provider_ref_id": "example-request-id",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",

 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:05:00Z"
 },
 "privy_digitalid": {

 "updated_at": "2026-06-15T07:04:00Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "kyc_transaction_id": "00000000-0000-0000-0000-000000000000",

 "application_id": "example-application-id",
 "status": "approved",
 "privy_id": "example-privy-id",

 "deeplink": "https://example.com/deeplink",
 "landing_url": "https://stg-oauth2.privypass.id/digitalid/landing?client_id=...&csrf=...&is_embed=true&request_id=...",
 "waiting_url": "",
 "session_expired_at": "2026-06-15T07:10:00+07:00"

 "identity": {
 "nik": "3200000000000000",
 "fullname": "John Doe",
 "dob": "1990-01-01"
 },

 }
}

---

## Get Shared Data

Fetches and RSA-decrypts the user's shared identity data — user_data (name, email, phone, NIK, dob, privy_id , signed KTP/selfie image URLs) and ktp_data (the decoded KTP fields: address, city, district, religion, marital status, etc.). This is where the NIK becomes known, so it also runs the NIK-dedup check and sets the transaction to success or rejected. Call it after the user approves the consent screen to retrieve their verified identity.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

transaction_idstring

UUID from /initiate response.## Response Body200

Success

status?string

data?object

Show Attributes

ktp_data?object

Show Attributes

address?string

blood_type?string

citizen?string

city_name?string

district_name?string

expiry_date?string

gender?string

marital_status?string

pob?string

profession?string

province_name?string

religion?string

rtrw?string

village_name?string

user_data?object

Show Attributes

dob?string

email?string

identity_card?string

identity_number?string

name?string

phone?string

privy_id?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "ktp_data": {
 "address": "JL. EXAMPLE NO. 1",
 "blood_type": "B",
 "citizen": "WNI",
 "city_name": "EXAMPLE CITY",
 "district_name": "EXAMPLE DISTRICT",
 "expiry_date": "SEUMUR HIDUP",
 "gender": "Perempuan",
 "marital_status": "Kawin",
 "pob": "EXAMPLE CITY",
 "profession": "PEGAWAI SWASTA",

 "religion": "Islam",
 "rtrw": "000/000",
 "village_name": "EXAMPLE VILLAGE"
 },
 "user_data": {

 "email": "testuser@example.com",
 "identity_card": "https://example.com/shared-data/ktp?token=example-token",
 "identity_number": "3200000000000000",

 "phone": "+628123456789",
 "privy_id": "example-privy-id",
 "selfie": "https://example.com/shared-data/selfie?token=example-token"
 }

}

---

## Privy Digital ID Usage

Lists paginated, call-level activity-log rows for a Digital ID transaction — e.g. initiate , connect , callback , get status , get shared-data , get identity , refresh-token , confirm-callback . details holds a JSON string with call-specific metadata — e.g. resolved / attempt for digitalid_get_shared_data , or session metadata ( request_id , expired_at ) for digitalid_connect .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

page?string

limit?string

status?string

Optional exact status filter.## Response Body200

Success

status?string

data?array<object>

Array Item

No Description

created_at?string

updated_at?string

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

details?string

pagination?object

Show Attributes

current_page?integer

next_page?string

prev_page?string

total_page?integer

total?integer

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": [
 {
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:00:00Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "privy_digitalid",
 "action_type": "digitalid_get_shared_data",
 "status": "success",
 "cost": 1,
 "details": "{\"limit\": \"5\", \"attempt\": \"1\", \"resolved\": true, \"has_active_subscription\": null}"
 },
 {
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:00:00Z",
 "id": "00000000-0000-0000-0000-000000000000",

 "reference_id": "example-reference-id",
 "provider": "privy_digitalid",
 "action_type": "digitalid_connect",

 "cost": 1,
 "details": "{\"metadata\": {\"os\": \"Unknown\", \"browser\": \"Unknown\", \"ip_address\": \"0.0.0.0\", \"user_agent\": \"PostmanRuntime/7.x\"}, \"expired_at\": \"2026-06-15T14:28:45+07:00\", \"request_id\": \"\"}"
 }
 ],
 "pagination": {
 "current_page": 1,
 "next_page": null,
 "prev_page": null,

 "total": 2
 }
}

---

## Initiate KYC — Vida

Starts a KYC transaction with the **Vida** provider and returns a redirect_url the user opens to complete verification. Requests are authenticated with signed X-Client-Id headers (see the Overview); there is no client_id in the body.

- provider is vida ; the redirect_url is the Vida microsite. Required: reference_id , provider , callback_url , email , phone (Indonesian format, e.g. +628… ).

- reference_id is a unique code **you generate** for each transaction — it must not be the same as a previous one.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

reference_id?string

provider?string

callback_url?string

email?string

phone?string
## Response Body200

Success

status?string

data?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

redirect_url?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "vida",
 "action_type": "initiate",
 "status": "pending",
 "billing_cost": 1,
 "provider_ref_id": "",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",
 "phone": "+628123456789",

 "updated_at": "2026-06-15T07:05:00Z",
 "redirect_url": "https://example.com/vida/verify?key=example-key"
 }
}

---

## Get Transaction Details

Returns the full audit detail for a **Vida** KYC transaction, decrypted server-side. A transaction that isn't yours returns 404 .

The response carries ocr , liveness , and fraud blocks (all decrypted server-side) alongside transaction and reject_reason .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Path Parameters

idstring

Transaction UUID.## Response Body200

Success

status?string

data?object

Show Attributes

transaction?object

Show Attributes

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

billing_cost?integer

provider_ref_id?string

callback_url?string

email?string

phone?string

created_at?string

ocr?object

Show Attributes

id?string

status?string

id_number?string

name?string

dob?string

gender?string

place_of_birth?string

blood_type?string

marital_status?string

religion?string

nationality?string

occupation?string

neighborhood_association_group?string

village?string

sub_district?string

city?string

province?string

valid_until?string

request_payload?object

Show Attributes

operations?array<string>

Array Item

No Description

payload?object

Show Attributes

country?string

group_id?string

id_front_side_image?string

id_subtype?string

id_type?string

partner_trx_id?string

user_consent?object

Show Attributes

country?string

obtained?boolean

obtained_at?string

user_i_p?string

response_payload?object

Show Attributes

card?object

Show Attributes

country?string

iso_alpha2_country_code?string

iso_alpha3_country_code?string

type?string

group_id?string

image_quality_result?object

Show Attributes

front?object

Show Attributes

blurriness?object

Show Attributes

score?number

threshold?number

card_dimension?object

Show Attributes

card_coordinates?object

Show Attributes

x1?integer

x2?integer

y1?integer

y2?integer

card_height?integer

card_width?integer

low_light?object

Show Attributes

score?number

threshold?number

over_exposure?object

Show Attributes

score?number

threshold?number

ocr_result?object

Show Attributes

front?object

Show Attributes

data?object

Show Attributes

id_number?object

Show Attributes

score?number

threshold?number

value?string

name?object

Show Attributes

score?number

threshold?number

value?string

dob?object

Show Attributes

score?number

threshold?number

value?string

address?object

Show Attributes

score?number

threshold?number

value?string

partner_trx_id?string

transaction_id?string

warnings?array<object>

Array Item

No Description

code?integer

message?string

operations?array<string>

Array Item

No Description

created_at?string

updated_at?string

liveness?object

Show Attributes

id?string

status?string

request_payload?object

Show Attributes

partner_trx_id?string

status?string

response_payload?object

Show Attributes

code?integer

img_manipulation_score?number

live_image?boolean

message?string

score?number

transaction_id?string

created_at?string

updated_at?string

fraud?object

Show Attributes

id?string

request_payload?object

Show Attributes

address?string

consent?object

Show Attributes

consent_given?boolean

consented_at?string

district?string

dob?string

email?string

gov_id?string

gov_id_type?string

id_card_photo?string

mobile?string

partner_trx_id?string

pob?string

province?string

selfie_photo?string

transaction_type?string

village?string

response_payload?object

Show Attributes

data?object

Show Attributes

assessment_results?array<object>

Array Item

No Description

name?string

result?integer

authentication_level?string

certificate?object

Show Attributes

detail?string

level?integer

fraud_assessment?string

transaction_id?string

transaction_type?string

created_at?string

updated_at?string

reject_reason?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "transaction": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "vida",
 "action_type": "verify",
 "status": "success",
 "billing_cost": 1,
 "provider_ref_id": "",
 "callback_url": "https://your-app.example.com/kyc-callback",
 "email": "testuser@example.com",

 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:05:00Z"
 },
 "ocr": {

 "status": "success",
 "id_number": "3200000000000000",
 "name": "John Doe",
 "dob": "01-01-1990",

 "place_of_birth": "EXAMPLE CITY",
 "blood_type": "-",
 "marital_status": "BELUM KAWIN",

 "nationality": "WNI",
 "occupation": "KARYAWAN SWASTA",
 "address": "JL. EXAMPLE NO. 1",

 "village": "EXAMPLE VILLAGE",
 "sub_district": "EXAMPLE SUBDISTRICT",
 "city": "EXAMPLE CITY",

 "valid_until": "SEUMUR HIDUP",
 "request_payload": {
 "operations": [
 "ocr"
 ],
 "payload": {

 "group_id": "EID_OCR_KYC",
 "id_front_side_image": "[omitted]",
 "id_subtype": "KTP",

 "partner_trx_id": "00000000-0000-0000-0000-000000000000"
 },
 "user_consent": {
 "country": "IDN",

 "obtained_at": "1700000000",
 "user_i_p": "0.0.0.0"
 }
 },
 "response_payload": {
 "card": {

 "iso_alpha2_country_code": "ID",
 "iso_alpha3_country_code": "IDN",
 "type": "KTP"
 },

 "image_quality_result": {
 "front": {
 "blurriness": {
 "score": 0,

 },
 "card_dimension": {
 "card_coordinates": {
 "x1": 0,
 "x2": 1766,

 "y2": 1131
 },
 "card_height": 1129,
 "card_width": 1766
 },

 "score": 0.34,
 "threshold": 0.95
 },
 "over_exposure": {
 "score": 0.77,

 }
 }
 },
 "ocr_result": {
 "front": {
 "data": {
 "id_number": {

 "threshold": 0.95,
 "value": "3200000000000000"
 },
 "name": {

 "threshold": 0.95,
 "value": "John Doe"
 },
 "dob": {
 "score": 0.96,

 "value": "01-01-1990"
 },
 "address": {
 "score": 0.72,

 "value": "JL. EXAMPLE NO. 1"
 }
 }
 }
 },
 "partner_trx_id": "00000000-0000-0000-0000-000000000000",

 "warnings": [
 {
 "code": 10029,
 "message": "Low confidence score for ocr, please check [address] for more details",

 "ocr"
 ]
 }
 ]
 },
 "created_at": "2026-06-15T07:02:00Z",
 "updated_at": "2026-06-15T07:02:00Z"
 },

 "id": "00000000-0000-0000-0000-000000000000",
 "status": "success",
 "request_payload": {

 "status": "COMPLETED"
 },
 "response_payload": {
 "code": 1043,
 "img_manipulation_score": 0.08,

 "message": "Selfie photo is a live photo",
 "score": 0.21,
 "transaction_id": "00000000-0000-0000-0000-000000000000"
 },

 "updated_at": "2026-06-15T07:03:00Z"
 },
 "fraud": {
 "id": "00000000-0000-0000-0000-000000000000",
 "request_payload": {

 "city": "EXAMPLE CITY",
 "consent": {
 "consent_given": true,

 },
 "district": "EXAMPLE DISTRICT",
 "dob": "1990-01-01",
 "email": "testuser@example.com",

 "gov_id": "3200000000000000",
 "gov_id_type": "KTP",
 "id_card_photo": "[omitted]",

 "partner_trx_id": "00000000-0000-0000-0000-000000000000",
 "pob": "EXAMPLE CITY",
 "province": "EXAMPLE PROVINCE",

 "transaction_type": "FULL_FRAUD_ASSESSMENT",
 "village": "EXAMPLE VILLAGE"
 },
 "response_payload": {
 "data": {
 "assessment_results": [

 "name": "full_name",
 "result": 1
 },
 {
 "name": "nik",

 },
 {
 "name": "dob",
 "result": 1
 },
 {

 "result": 0.9
 },
 {
 "name": "liveness",
 "result": 0.21
 }

 "authentication_level": "AAL2",
 "certificate": {
 "detail": "The certificate has been trusted for the purpose of digital signatures.",
 "level": 2
 },

 "transaction_id": "00000000-0000-0000-0000-000000000000",
 "transaction_type": "FULL_FRAUD_ASSESSMENT"
 }
 },

 "updated_at": "2026-06-15T07:05:00Z"
 },
 "reject_reason": ""
 }
}

---

## Vida Usage

Lists paginated, call-level activity-log rows for every Vida action (e.g. verify , ocr , liveness , webhook_dispatch ) — a per-call audit trail for the transaction. details holds a JSON string for non-success outcomes — e.g. a webhook_dispatch that ends failed_all_retries records the target callback_url .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header ## Query Parameters

page?string

limit?string

status?string

Optional exact status filter.## Response Body200

Success

status?string

data?array<object>

Array Item

No Description

created_at?string

updated_at?string

id?string

client_id?string

reference_id?string

provider?string

action_type?string

status?string

details?string

pagination?object

Show Attributes

current_page?integer

next_page?string

prev_page?string

total_page?integer

total?integer

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": [
 {
 "created_at": "2026-06-15T07:00:00Z",
 "updated_at": "2026-06-15T07:00:00Z",
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "provider": "vida",
 "action_type": "webhook_dispatch",
 "status": "failed_all_retries",
 "cost": 0,
 "details": "{\"callback_url\": \"https://your-app.example.com/kyc-callback\"}"
 }
 ],
 "pagination": {
 "current_page": 1,
 "next_page": null,
 "prev_page": null,

 "total": 1
 }
}

---

## Resend Webhook

Re-sends the most recently dispatched webhook for transaction_id to its callback URL — byte-for-byte identical to the original. One synchronous attempt is made. delivered is true only if the tenant responded with HTTP < 400. Requires that a webhook was already dispatched at least once.
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

transaction_id?string
## Response Body200

Success

status?string

data?object

Show Attributes

delivered?boolean

attempt_number?integer

http_status?integer

error_message?string

callback_url?string

cURLJavaScriptGoPythonJavaC#Example default{
 "status": "success",
 "data": {
 "delivered": true,
 "attempt_number": 5,
 "http_status": 200,
 "error_message": "",
 "callback_url": "https://your-app.example.com/kyc-callback"
 }
}

---

## Validate Webhook

Looks up the most recent webhook log for a transaction, scoped to your tenant. transaction_id and reference_id are both optional but at least one is required; if both are given they must match the same log row. No match returns { "status": "failed", "data": null } .
## Authorization

X-Client-Id<token>

Your tenant client_id .

In: header 

X-Timestamp<token>

Unix time in seconds; must be within 5 minutes of the server clock.

In: header 

X-Nonce<token>

A unique value per request (e.g. a UUID). Reusing one is rejected as a replay (409).

In: header 

X-Signature<token>

Hex HMAC-SHA256 of METHOD\npath\nX-Timestamp\nX-Nonce\nSHA256hex(body) , keyed by your base64-decoded api_secret.

In: header 
## Request Body

transaction_id?string

reference_id?string
## Response Body200

Success

status?string

data?object

Show Attributes

event?string

transaction?string

client_id?string

reference_id?string

status?string

reject_reason?string

provider?string

timestamp?string

data?object

Show Attributes

nik?string

fullname?string

dob?string

cURLJavaScriptGoPythonJavaC#Example match{
 "status": "success",
 "data": {
 "event": "kyc.status.updated",
 "transaction": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "status": "success",
 "reject_reason": "",
 "provider": "vida",
 "timestamp": "2026-06-15T07:00:00Z",
 "data": {
 "nik": "3200000000000000",
 "fullname": "John Doe",

 }
 }
} Example no_match {
 "status": "failed",
 "data": null
}

---

## KYC Success Webhook

The payload your callback_url receives when a KYC completes successfully.

When a KYC transaction reaches a terminal outcome, the KYC Gateway sends a **POST** to your callback_url (set at Initiate KYC). The payload shape is **identical across all three providers** ( privy , privy_digitalid , vida ) — integrate once.

Acknowledge with any 2xx status; the body is ignored. To fetch full decrypted detail, call Get Transaction Details with the transaction UUID.
## Success payload
{
 "event": "kyc.status.updated",
 "transaction": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "status": "success",
 "reject_reason": "",
 "provider": "vida",

 "data": {
 "nik": "3200000000000000",
 "fullname": "John Doe",
 "dob": "1990-01-01"

}

| Field| Description
| event | Always kyc.status.updated .
| transaction | The transaction UUID from /initiate.
| reference_id | Your own identifier passed at /initiate.
| status | success or rejected .
| provider | privy · privy_digitalid · vida .
| reject_reason | Cause of a rejection (empty on success).
| data.nik | Indonesian national ID number (NIK).
| data.fullname | Full name from the KTP.
| data.dob | Date of birth (YYYY-MM-DD).
###

---

## KYC Rejected Webhook

The payload your callback_url receives when a KYC is rejected.

When a KYC transaction reaches a terminal outcome, the KYC Gateway sends a **POST** to your callback_url (set at Initiate KYC). The payload shape is **identical across all three providers** ( privy , privy_digitalid , vida ) — integrate once.

Acknowledge with any 2xx status; the body is ignored. To fetch full decrypted detail, call Get Transaction Details with the transaction UUID.

On rejection, data may still be populated — a NIK-already-registered rejection resolves the identity first (as shown here). Some early rejections (e.g. the user declines consent) can instead have empty data . reject_reason carries the cause (e.g. nik already use in other user , VERIFICATION.CRITICAL_ASSESSMENT_FAILED , user rejected data sharing consent ).
## Rejected payload
{
 "event": "kyc.status.updated",
 "transaction": "00000000-0000-0000-0000-000000000000",
 "client_id": "example-client-id",
 "reference_id": "example-reference-id",
 "status": "rejected",

 "provider": "vida",
 "timestamp": "2026-06-15T07:05:00Z",
 "data": {
 "nik": "3200000000000000",

 "dob": "1990-01-01"
 }
}

| Field| Description
| event | Always kyc.status.updated .
| transaction | The transaction UUID from /initiate.
| reference_id | Your own identifier passed at /initiate.
| status | success or rejected .
| provider | privy · privy_digitalid · vida .
| reject_reason | Cause of a rejection (empty on success).
| data.nik | Indonesian national ID number (NIK).
| data.fullname | Full name from the KTP.
| data.dob | Date of birth (YYYY-MM-DD).
###

---


# Template API

## Overview

Design, store, and reuse certificate templates — then render them into real images your app keeps.

The **Template API** is a multi-tenant service that hosts your certificate/credential
**templates** so an issuer app never has to build template management itself. Plug in your
 client_id + client_secret and you can:

- **Design** templates in a hosted WYSIWYG editor (or via the API) — background image, text, attributes, images, and QR codes.

- **Reuse** one template across **many schemas/events** — link it, then look it up by schema at issue time.

- **Render** a template + your data into a **real image** (JPEG) and get the bytes back to store wherever you want.

What you don't manage

You don't build a template editor, you don't design storage for template assets, and — importantly —
**we do not store your certificates**. render returns the image bytes; *you* decide where they live
(your own storage/S3, a file, or embedded in a VC). Think of it like a KYC/liveness service: you call
it and keep the result.
## Base URLs

- 🛠️ Sandbox: https://api-template.sandbox.e.id 

- 🌍 Production: https://api.template.e.id 
## Getting Access

Access is granted per client. Contact **support@corp.e.id** to be onboarded; you receive a
 client_id and a client_secret .

Keep the secret server-side

Your client_secret must **never** reach the browser. Mint tokens on your server. To open the hosted
editor, ask for an editor link server-side and send the user to
the returned redirect_uri — that URL carries a short opaque code (not a token), and the editor obtains and refreshes the token itself.
## Authentication

Every template call uses a **bearer JWT**. Exchange your credentials once via ,
then send the token as Authorization: Bearer <token> on every other call. Tokens expire ( expires_in 
seconds) — mint a new one when needed.
## How the flow works

- **Get credentials** — get onboarded to receive your client_id / client_secret (see Authentication).

- **Design a template** — get an editor link and send the user to the hosted editor. Designing, editing, and image uploads all happen inside the editor.

- **Link it to your schema(s)** — set schema_ids on the template. One template can serve many schemas (see One template, many schemas).

- **Issue** — at issue time, find the template (by id you stored, or by schema), then call Generate Certificate with your data.

- **Store the image** — render returns the JPEG bytes; save them wherever you want. We keep nothing.

Prefer the SDK?

The ** eid-template-sdk ** npm package wraps all of this — createTemplateClient({ baseUrl, clientId, clientSecret }) gives you templates.list/get/create/update/remove , templates.bySchema(id) ,
 generate({ templateId, data }) (returns the image bytes), and an embeddable <TemplateEditor /> . It
handles token minting/refresh for you.
## One template, many schemas

A template is a **reusable asset**, not owned by a single schema. Link it to as many schemas/events as
you like with schema_ids , then resolve it at issue time — update the template's schema_ids on
create/update, and look it up for any linked schema with Get Template by Schema
(the same template comes back for every schema it's linked to).

You can also just store the template.id on your own event/schema record and skip bySchema .
## Dynamic attributes

Attributes are **not fixed by the service** — they come from *your* schema. The editor's attribute
palette is whatever your app provides, and designers can add any field on the fly. That's why the same
service fits a membership app, a course platform, or any issuer: each supplies its own fields.

- **SDK editor** — pass an attributes list: <TemplateEditor attributes={[{ field: "holder_name", label: "Holder Name" }]} /> . Derive it from your schema.

- **Hosted editor (link)** — append a fields query param: ?fields=holder_name|Holder Name,course|Course,issued_at . Each item is field or field|Label , comma-separated.

- **Free-form** — designers can always type a new field in the editor; the set is saved on the template's fields and reused next time it's opened.

The keys you place are exactly the keys you send to Generate Certificate — no fixed schema, no app-specific names.

Which fields does a template need?

Get the template and read its ** fields ** array — each entry is a
 field (the key to send) with an optional label , type , and required flag. That is the exact list
of keys to pass at generate time.
## Endpoint guide

Every endpoint, grouped like the sidebar.
### 🔑 Authentication

| Endpoint| Method| What it does
| Get Access Token| POST| Exchange client_id + client_secret for a bearer token. This is the only auth a client needs.
### 🗂️ Templates

| Endpoint| Method| What it does
| List Templates| GET| Your templates, newest first (filter by search / schema_id ).
| Get Template| GET| Fetch a template by id.
| Get Template by Schema| GET| Resolve the template linked to a schema.
| Import / Sync| POST| Bulk-import templates (preserve id, upsert) — background job with a result summary.
| Delete Template| DELETE| Soft-delete a template.
### ✏️ Editor

| Endpoint| Method| What it does
| Editor Link (Add)| POST| Get a link to the hosted editor to **create** a template.
| Editor Link (Edit)| POST| Get a link to the hosted editor to **edit** an existing template.

Creating & editing templates

Templates are created and edited **inside the hosted editor**, not via direct API calls. Launch it with an editor link.
### 🖼️ Rendering

| Endpoint| Method| What it does
| Generate Certificate| POST| Render template + data → **image bytes** (not stored).
| Generate to URL| POST| Render + upload to storage → returns the image **URL**.
### 🔔 Webhooks

Set your endpoint with PUT /client/webhook ; the service then **POSTs to your URL** when a template is saved. See Webhooks for the payload, how to set the URL, and how to verify the X-EID-Signature .
## Postman Collection

Set template_base_url , template_client_id , and template_client_secret , then run **Authentication → Get Access Token** first —
it saves the bearer token for every other request. Variables are prefixed template_ so they don't clash with the other e.id collections.

Download Collection
###

---

## Get Access Token

Exchange your client_id + client_secret for a bearer token. Send the returned access_token as Authorization: Bearer <token> on every template call. **Keep the secret server-side** — never ship it to a browser.
## Request Body

client_idstring

client_secretstring
## Response Body200

Token issued

data?object

Show Attributes

access_token?string

token_type?string

expires_in?integer

Seconds until the token expires.401

Invalid client credentials

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "access_token": "example-access-token",
 "token_type": "Bearer",
 "expires_in": 3600
 }
}Empty

---

## List Templates

List your templates, newest first. Filter by name with search , or by a linked schema with schema_id .
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

page?integer

Default 1 

per_page?integer

Default 20 

search?string

Case-insensitive match on template name.

schema_id?string

Return only templates linked to this schema.## Response Body200

Templates for your client (newest first).

data?array<object>

Array Item

No Description

id?string

Format uuid 

client_id?string

Format uuid 

name?string

template_image_url?string

boxes?object

Empty Object

size?string

orientation?string

background_color?string

qr_logo_url?string

fields?array<object>

Array Item

No Description

Empty Object

schema_ids?array<string>

Array Item

No Description

created_at?string

Format date-time 

updated_at?string

Format date-time 

meta?object

Show Attributes

total?integer

page?integer

limit?integer

cURLJavaScriptGoPythonJavaC#Example default{
 "data": [
 {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "00000000-0000-0000-0000-000000000000",
 "name": "Certificate Example",
 "template_image_url": "",
 "boxes": {
 "boxes": [
 {
 "id": "box-1",
 "type": "attribute",
 "field": "full_name",
 "x": 60,
 "y": 150,
 "width": 800,

 "fontSize": 48
 }
 ],
 "template_width": 1123,
 "template_height": 794

 "size": "a4",
 "orientation": "landscape",
 "background_color": "#FFFFFF",
 "qr_logo_url": "",

 {
 "field": "full_name",
 "label": "Full Name"
 }
 ],
 "schema_ids": [

 ],
 "created_at": "2026-07-27T10:00:00+07:00",
 "updated_at": "2026-07-27T10:00:00+07:00"
 }
 ],
 "meta": {

 "page": 1,
 "limit": 20
 }
}

---

## Get Template

Fetch a single template by id, including its schema_ids .
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

Format uuid ## Response Body200

The template.

data?object

Show Attributes

id?string

Format uuid 

client_id?string

Format uuid 

name?string

template_image_url?string

boxes?object

Empty Object

size?string

orientation?string

background_color?string

qr_logo_url?string

fields?array<object>

Array Item

No Description

Empty Object

schema_ids?array<string>

Array Item

No Description

created_at?string

Format date-time 

updated_at?string

Format date-time 404

Template not found

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "00000000-0000-0000-0000-000000000000",
 "name": "Certificate Example",
 "template_image_url": "",
 "boxes": {
 "boxes": [
 {
 "id": "box-1",
 "type": "attribute",
 "field": "full_name",
 "x": 60,
 "y": 150,
 "width": 800,

 "fontSize": 48
 }
 ],
 "template_width": 1123,
 "template_height": 794
 },

 "orientation": "landscape",
 "background_color": "#FFFFFF",
 "qr_logo_url": "",
 "fields": [

 "field": "full_name",
 "label": "Full Name"
 }
 ],
 "schema_ids": [
 "example-schema"
 ],

 "updated_at": "2026-07-27T10:00:00+07:00"
 }
}Empty

---

## Get Template by Schema

Return the template linked to a schema. Since one template can serve many schemas, the same template is returned for each schema it is linked to. Great for issue-time lookup. Returns 404 if nothing is linked.
## Authorization

AuthorizationBearer <token>

In: header ## Query Parameters

schema_idstring
## Response Body200

The template.

data?object

Show Attributes

id?string

Format uuid 

client_id?string

Format uuid 

name?string

template_image_url?string

boxes?object

Empty Object

size?string

orientation?string

background_color?string

qr_logo_url?string

fields?array<object>

Array Item

No Description

Empty Object

schema_ids?array<string>

Array Item

No Description

created_at?string

Format date-time 

updated_at?string

Format date-time 404

No template linked to this schema

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "00000000-0000-0000-0000-000000000000",
 "name": "Certificate Example",
 "template_image_url": "",
 "boxes": {
 "boxes": [
 {
 "id": "box-1",
 "type": "attribute",
 "field": "full_name",
 "x": 60,
 "y": 150,
 "width": 800,

 "fontSize": 48
 }
 ],
 "template_width": 1123,
 "template_height": 794
 },

 "orientation": "landscape",
 "background_color": "#FFFFFF",
 "qr_logo_url": "",
 "fields": [

 "field": "full_name",
 "label": "Full Name"
 }
 ],
 "schema_ids": [
 "example-schema"
 ],

 "updated_at": "2026-07-27T10:00:00+07:00"
 }
}Empty

---

## Import / Sync

Bulk-import templates into your account — handy when migrating from another system. Each item must
follow **this service's template structure** (same shape as Get Template)
and is validated before it's stored.

- **ID is preserved** — each item's id becomes the template id. Re-importing the same id **updates** it (upsert), so the job is safe to re-run.

- **Validated** — invalid items (bad id , missing name , malformed boxes , unknown size / orientation ) are skipped and reported; valid ones still go in.

- **Runs in the background** — the call returns a **job** right away ( 202 ). Poll the job to get the result: how many succeeded / failed and why.

- One id can only belong to **one client** — importing an id already owned by another client fails that item.

- Max **500** templates per request (chunk larger sets; the request body is capped at 2 MB).

Poll the result with Import Status.
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

templatesarray<object>

Array Item

No Description

idstring

Preserved as the template id (must be a UUID).

Format uuid 

namestring

boxesobject

Layout object { boxes, template_width, template_height }.

Empty Object

size?string

Default "a4" 

Value in "a4" | "business-card" 

orientation?string

Default "landscape" 

Value in "landscape" | "portrait" 

background_color?string

Default "#FFFFFF" 

template_image_url?string

qr_logo_url?string

fields?array<object>

Array Item

No Description

Empty Object

schema_ids?array<string>

Array Item

No Description## Response Body202

Import job accepted (running).

data?object

Show Attributes

id?string

Format uuid 

status?string

Value in "running" | "completed" 

total?integer

succeeded?integer

failed?integer

errors?array<object>

Array Item

No Description

template_id?string

error?string

created_at?string

Format date-time 

finished_at?string | null

Format date-time 400

Invalid request or too many templates (max 500)

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "status": "running",
 "total": 3,
 "succeeded": 0,
 "failed": 0,
 "errors": [],
 "created_at": "2026-07-27T10:00:00+07:00",
 "finished_at": null
 }
}Empty

---

## Import Status

Poll an import job started by Import / Sync. Returns how many
templates **succeeded** / **failed** and, for each failed item, the reason. Scoped to your client —
you can only read your own jobs.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

job_idstring

Format uuid ## Response Body200

Job status.

data?object

Show Attributes

id?string

Format uuid 

status?string

Value in "running" | "completed" 

total?integer

succeeded?integer

failed?integer

errors?array<object>

Array Item

No Description

template_id?string

error?string

created_at?string

Format date-time 

finished_at?string | null

Format date-time 404

Job not found

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "id": "00000000-0000-0000-0000-000000000000",
 "status": "completed",
 "total": 3,
 "succeeded": 2,
 "failed": 1,
 "errors": [
 {
 "template_id": "not-a-uuid",
 "error": "invalid id: must be a UUID"
 }
 ],
 "created_at": "2026-07-27T10:00:00+07:00",
 "finished_at": "2026-07-27T10:00:01+07:00"
 }
}Empty

---

## Delete Template

Soft-delete a template. Its schema links are removed with it.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

Format uuid ## Response Body200

Template deleted

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "message": "Template deleted"
 }
}

---

## Editor Link (Add)

Templates are designed in the **hosted editor**, not created via a direct API call. Ask for an editor link, then send the user to the returned redirect_uri — the template is created when they save.

- redirect_uri carries a short opaque code , not a long token; the hosted editor swaps it for a short-lived token and keeps it refreshed while the tab stays active. You never build the URL or handle tokens yourself.

- Optional schema_id pre-links a schema; optional fields seed the editor's attribute palette ( field + optional label ).

- Call this with your **access token** (from Get Access Token).
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

schema_id?string

Schema to link the template to.

fields?array<object>

Seed the editor's attribute palette.Array Item

No Description

fieldstring

label?string
## Response Body200

A ready-to-open editor link.

data?object

Show Attributes

redirect_uri?string

Open this in a browser to launch the hosted editor.

expires_in?integer

Seconds until the code expires if unused (idle window).

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "redirect_uri": "https://editor.example/embed/editor?code=example-editor-code&close=true",
 "expires_in": 1800
 }
}

---

## Editor Link (Edit)

Open an **existing** template in the hosted editor. Same as Editor Link (Add), but the template id is in the path — changes are saved inside the editor.

- redirect_uri carries a short opaque code , not a long token; the hosted editor swaps it for a short-lived token and keeps it refreshed while the tab stays active.

- Optional schema_id / fields adjust the linked schema or the attribute palette.

- Call this with your **access token**.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

Format uuid 
## Request Body

schema_id?string

Schema to link the template to.

fields?array<object>

Seed the editor's attribute palette.Array Item

No Description

fieldstring

label?string
## Response Body200

A ready-to-open editor link.

data?object

Show Attributes

redirect_uri?string

Open this in a browser to launch the hosted editor.

expires_in?integer

Seconds until the code expires if unused (idle window).

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "redirect_uri": "https://editor.example/embed/editor?code=example-editor-code&close=true",
 "expires_in": 1800
 }
}

---

## Generate Certificate

Render the template with your data into a **real image** and get the raw JPEG bytes back. The service **does not store the certificate** — you save the image wherever you want (your own storage/S3, a file, or embedded in a VC as a base64 data URI).

- Keys in data map to the template's dynamic boxes by their field .

- Dynamic image / QR boxes take a URL string.

**Response formats** — add ?format= : jpeg (default) or png stream raw image bytes; base64 returns JSON with a data: URI, handy for embedding straight into a VC.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

Format uuid ## Query Parameters

record_id?string

Optional reference of your own (e.g. a user id).

format?string

jpeg (default) / png → raw image bytes; base64 → JSON with a data-URI image.

Default "jpeg" 

Value in "jpeg" | "png" | "base64" 
## Request Body

Empty Object## Response Body200

The rendered certificate image (raw bytes).

response?string

response?string

data?object

Show Attributes

image?string

data:<content_type>;base64,<...>

content_type?string

404

Template not found

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
 "content_type": "image/jpeg"
 }
}Empty

---

## Generate to URL

Same render as generate , but the service **uploads the image for you** to object storage (S3) and returns just the **URL**. Use this when you'd rather store a link than handle image bytes yourself.

- Each client's files live under their own folder ( renders/<client>/… ), so images never mix between clients.

- Pass record_id to name the file (a short unique suffix is added so repeated renders don't overwrite each other).

- Default is JPEG; add ?format=png for PNG.

Opt-in per client

This endpoint is only available if internal render/storage is enabled for your client. If it isn't, the call returns **403** — use Generate Certificate instead and store the image yourself.
## Authorization

AuthorizationBearer <token>

In: header ## Path Parameters

idstring

Format uuid ## Query Parameters

record_id?string

Optional reference of your own (e.g. a user id). Used as the uploaded file name.

format?string

jpeg (default) or png.

Default "jpeg" 

Value in "jpeg" | "png" 
## Request Body

Empty Object## Response Body200

The image was rendered and uploaded. Returns its public URL.

data?object

Show Attributes

url?string

Public URL of the uploaded image.

content_type?string

403

Internal render/storage is not enabled for this client404

Template not found503

Image storage unavailable

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "url": "https://your-bucket.s3.ap-southeast-1.amazonaws.com/renders/example-client-id/user-123.jpg",
 "content_type": "image/jpeg"
 }
}EmptyEmptyEmpty

---

## Overview

What the Template service POSTs to your webhook URL, and how to verify it.

If your client has a **webhook URL** configured, the service notifies you when a template is
saved in the hosted editor. Delivery is **asynchronous** (it never blocks the editor) and sent
as a single POST to your URL.

Set the URL from your side with Set Webhook URL.
## When it fires

| Event| Meaning
| template.created | A new template was saved for your client.
| template.updated | An existing template was re-saved.

Scope

Only these two save events are sent today. Deleting a template or generating an image does **not** trigger a webhook.
## The request we send

 POST to your configured URL with:

| Header| Value
| Content-Type | application/json 
| X-EID-Timestamp | Unix seconds when the event was sent.
| X-EID-Delivery | Unique delivery id (UUID) — use it to dedupe / ignore replays.
| X-EID-Signature | sha256=<hex> — HMAC-SHA256 of <timestamp>.<raw body> using your webhook_secret 

Body:
{
 "event": "template.updated",
 "template": {
 "id": "00000000-0000-0000-0000-000000000000",
 "client_id": "00000000-0000-0000-0000-000000000000",
 "name": "Certificate Example",
 "template_image_url": "",
 "size": "business-card",
 "orientation": "landscape",
 "background_color": "#1e40af",
 "qr_logo_url": "",
 "fields": [{ "field": "name" }, { "field": "dob" }, { "field": "gender" }],
 "schema_ids": ["example-schema"],
 "boxes": {
 "template_width": 324,
 "template_height": 204,
 "boxes": [
 { "id": "7c9...", "type": "attribute", "field": "name", "x": 10, "y": 14, "width": 300, "height": 32 }
 ]
 },
 "created_at": "2026-07-23T14:22:42.241841+07:00",
 "updated_at": "2026-07-27T11:08:16.113311+07:00"
 }
}

 template is the full template object — the same shape returned by Get Template.
## Verify the signature

Recompute the HMAC over {timestamp}.{rawBody} — the X-EID-Timestamp header, a literal dot,
then the **raw request body** (not a re-serialized copy) — with your webhook_secret , compare in
constant time, and **reject stale timestamps** (e.g. older than 5 minutes) to block replays.

- Your webhook_secret (prefix whsec_ ) is returned by Set Webhook URL and shown once when the client is provisioned. Keep it server-side.

- Respond with 2xx to acknowledge. Non-2xx / timeouts are logged on our side.

No retries

Delivery is best-effort and **not** retried. If your endpoint is down, the event is missed — treat webhooks as a convenience, and reconcile with List Templates when needed.
###

---

## Set Webhook URL

Point the service at your endpoint (or send an empty string to disable webhooks). The response
returns your current webhook_url and webhook_secret — the secret used to sign the
 X-EID-Signature header on every delivery (see Overview).
## Authorization

AuthorizationBearer <token>

In: header 
## Request Body

webhook_url?string

Your HTTPS endpoint, or empty to disable.## Response Body200

Updated.

data?object

Show Attributes

webhook_url?string

webhook_secret?string

400

Invalid webhook URL

cURLJavaScriptGoPythonJavaC#Example default{
 "data": {
 "webhook_url": "https://app.example.com/webhooks/eid",
 "webhook_secret": "whsec_example"
 }
}EmptyEmpty

---
