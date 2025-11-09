import { beforeAll, describe, expect, test } from "@jest/globals";
import { createUser } from "./utils";
import axios from "axios";
import { backend_url } from "./config";


describe("Website creation", () => {
    let token: string, user_id: string;

    beforeAll(async () => {
        const data = await createUser()
        user_id = data.id
        token = data.token
    })

    test('Website entry not create if the token is not present in header', async () => {
        try {
            const res = await axios.post(`${backend_url}/website`, {
                url: "google.com",
            });
            expect(false).toBe("This test should fail because of token is not present in headers.");
        } catch (err: any) {
            if (err.response) {
                expect(err.response.status).toBe(401);
                expect(err.response.data).toHaveProperty("msg", "Unauthorized user");
            } else {
                throw err;
            }
        }
    })

    test('Website entry created', async () => {
        try {
            const res = await axios.post(`${backend_url}/website`, {
                url: "https://google.com",
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            expect(res.status).toBe(200);
        } catch (err: any) {
            throw err;
        }
    })

    test('Website entry not created if url is not present', async () => {
        try {
            const res = await axios.post(`${backend_url}/website`, {
                url: "",
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            expect(false).toBe("This test should fail because of url is not present in body.");
        } catch (err: any) {
             if (err.response) {
                expect(err.response.status).toBe(400);
                expect(err.response.data).toHaveProperty("msg", "Invalid inputs");
            } else {
                throw err;
            }
        }
    })
})