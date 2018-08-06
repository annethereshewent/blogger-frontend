export class User {
    constructor(user_id, username, token, avatar) {
        this.user_id = user_id,
        this.username = username;
        this.token = token;
        this.avatar = avatar;
    }
    user_id: number;
    username: string;
    token: string;
    avatar: string;
}