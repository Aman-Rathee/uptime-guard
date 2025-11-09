import { describe, expect, test } from '@jest/globals';
import axios from 'axios';
import { backend_url } from "./config"


describe('Sign up endpoints', () => {

    test("User signup successfully", async () => {
        try {
            const res = await axios.post(`${backend_url}/auth/signup`, {
                email: `aman${Date.now()}@gmail.com`,
                password: "my_password"
            })
            expect(res.status).toBe(200)
            expect(res.data).toHaveProperty("token")
        } catch (err) {
            throw err;
        }
    })


    test('Not able to sign up if incorrect inputs', async () => {
        try {
            const res = await axios.post(`${backend_url}/auth/signup`, {
                email: "not-an-email",
                password: ""
            });

            expect(false).toBe("This test should fail because of wrong input.");
        } catch (err: any) {
            if (err.response) {
                expect(err.response.status).toBe(400);
                expect(err.response.data).toHaveProperty("msg", "Invalid inputs");
            } else {
                throw err;
            }
        }
    });

    test("User already exist", async () => {
        let userEmail = `aman${Date.now()}@gmail.com`;

        await axios.post(`${backend_url}/auth/signup`, {
            email: userEmail,
            password: "my_password"
        })
        try {
            const res = await axios.post(`${backend_url}/auth/signup`, {
                email: userEmail,
                password: "my_password"
            })
            expect(false).toBe("This test should fail because user already exist.");
        } catch (err: any) {
            if (err.response) {
                expect(err.response.status).toBe(400);
                expect(err.response.data).toHaveProperty("msg", "User already exist");
            } else {
                throw err;
            }
        }
    })
});

describe('Sign in endpoints', () => {
    test("User not able to sign in if incorrect inputs", async () => {
        try {
            await axios.post(`${backend_url}/auth/signin`, {
                email: "not-an-email",
                password: ""
            });

            expect(false).toBe("This test should fail because of wrong input.");
        } catch (err: any) {
            if (err.response) {
                expect(err.response.status).toBe(400);
                expect(err.response.data).toHaveProperty("msg", "Invalid inputs");
            } else {
                throw err;
            }
        }
    })


    test("User able to sign in", async () => {
        let userEmail = `aman${Date.now()}@gmail.com`;

        await axios.post(`${backend_url}/auth/signup`, {
            email: userEmail,
            password: "my_password"
        })
        const res = await axios.post(`${backend_url}/auth/signin`, {
            email: userEmail,
            password: "my_password"
        })
        expect(res.status).toBe(200)
        expect(res.data).toHaveProperty("token")
    }, 10 * 1000)


    test("User not able to sign in if password is wrong", async () => {
        let userEmail = `aman${Date.now()}@gmail.com`;

        await axios.post(`${backend_url}/auth/signup`, {
            email: userEmail,
            password: "my_password"
        })
        try {
            const res = await axios.post(`${backend_url}/auth/signin`, {
                email: userEmail,
                password: "password"
            })
            expect(res.status).toBe(400)
            expect(res.data).toHaveProperty("msg", "Invalid credential")
        } catch (err: any) {
            if (err.response) {
                expect(err.response.status).toBe(400);
                expect(err.response.data).toHaveProperty("msg", "Invalid credential");
            } else {
                throw err;
            }
        }
    }, 10 * 1000)

})