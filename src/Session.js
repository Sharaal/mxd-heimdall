class Session {
  constructor(client, session) {
    this.sessionId = session.sessionId;
    this.autoLoginPin = session.autoLoginPin;
    this.client = client;
    this.customer = { customerId: session.customer.customerId };
  }

  async keepAlive() {
    try {
      await this.client.post('/auth/keepalive', {
        headers: { 'mxd-session': this.sessionId },
      });
    } catch (e) {
      const session = await this.client.post('autologin_portal', {
        body: { autoLoginPin: this.autoLoginPin },
      });
      return new Session(this.client, session);
    }
  }

  static async get(client, email, password) {
    const session = await client.post('auth/login', {
      body: {
        userId: email,
        phrase: password,
        autoLogin: true
      },
    });
    return new Session(client, session);
  }
}

module.exports = Session;
