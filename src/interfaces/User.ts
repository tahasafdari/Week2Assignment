interface User {
    _id: number;
    user_name: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
  }
  
  interface UserOutput extends Partial<User> {
    _id: number;
    user_name: string;
    email: string;
  }
  
  interface PutUser extends Partial<User> {
    user_name?: string;
    email?: string;
    password?: string;
    role?: 'user' | 'admin';
  }
  
  interface LoginUser extends Partial<User> {
    user: {
      _id: number;
      user_name: string;
      email: string;
    };
    token: string;
  }
  
  interface UserTest extends Partial<User> {
    user_name: string;
    email: string;
    password: string;
  }
  
  export {User, UserOutput, LoginUser, UserTest, PutUser};