## Steps for setting up the project locally

- Clone the repository
- Install the dependencies by running `npm i`
- Create a `.env` file that should contain the following keys:
    - `DATABASE_URI` - The MongoDB URI String
    - `ACCESS_TOKEN_SECRET` - The secret for the access token
    - `REFRESH_TOKEN_SECRET` - The secret for the refresh token

- Run `npm run dev` to start the server