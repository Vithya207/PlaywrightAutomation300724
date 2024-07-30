exports.LoginPage = class LoginPage{
    constructor(page){
        this.page = page;
        this.usernameText = '#username';
        this.passwordText = '#password';
        this.loginButton = '#doLogin';
        this.letMeHack = 'text=Let me hack!';
    }

    async gotoLoginPage(){
        await this.page.goto('/#/admin');
        console.log('Current page:', this.page.url());
    }

    async login(username, password){
        await this.page.fill(this.usernameText, username);
        await this.page.fill(this.passwordText, password);
        await this.page.click(this.loginButton);
        await this.page.waitForSelector(this.letMeHack, { state: 'visible' });
        await this.page.click(this.letMeHack);
    }
}