import httpx
import asyncio
import os

async def test_flow():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8090", timeout=30.0) as client:
        print("1. Logging in...")
        login_res = await client.post("/api/auth/login", data={"username": "employee@enterprise.com", "password": "enterprise123"})
        if login_res.status_code != 200:
            print("Login failed:", login_res.text)
            return
            
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("2. Uploading document...")
        file_path = r"D:\enterprise-ai-knowledge-assistant\sample-docs\Company_Leave_Policy.txt"
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, "text/plain")}
            upload_res = await client.post("/api/documents?department=HR", headers=headers, files=files)
            
        if upload_res.status_code != 200:
            print("Upload failed:", upload_res.text)
            return
            
        print("Upload success:", upload_res.json())
        
        print("3. Querying RAG...")
        # Get conversations
        convs_res = await client.get("/api/chat/conversations", headers=headers)
        convs = convs_res.json()
        if not convs:
            # create one
            conv_res = await client.post("/api/chat/conversations", headers=headers)
            if conv_res.status_code != 200:
                print("Create conv failed:", conv_res.text)
                return
            conv_id = conv_res.json()["id"]
        else:
            conv_id = convs[0]["id"]
            
        msg_res = await client.post(f"/api/chat/conversations/{conv_id}/messages", headers=headers, json={"content": "What is the leave policy?", "answerMode": "Concise"})
        
        if msg_res.status_code != 200:
            print("Query failed:", msg_res.text)
        else:
            print("Query success:", msg_res.json()["content"])

if __name__ == "__main__":
    asyncio.run(test_flow())
