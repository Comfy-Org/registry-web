export const GET = () => {
    // device flow
    // 1.
    // POST https://github.com/login/device/code
    // client_id=YOUR_CLIENT_ID
    // scope=YOUR_SCOPES
    //
    // By default, the response takes the following form:
    // device_code=0000000000000000000000000000000000000000&expires_in=900&interval=5&user_code=WDJB-MJHT&verification_uri=https%3A%2F%2Fgithub.com%2Flogin%2Fdevice
    //
    // prompt user to visit verification_uri and enter user_code
    // 2. https://github.com/login/device
    //
    // 3. polls github to check if user has completed the verification
}
