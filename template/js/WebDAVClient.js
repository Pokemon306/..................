class WebDAVClient {
    constructor(baseUrl, username, password) {
        this.baseUrl = baseUrl;
        this.credentials = btoa(`${username}:${password}`); // Base64 编码认证信息
    }

    // 设置请求头（包含认证信息）
    getHeaders(method) {
        const headers = {
            Authorization: `Basic ${this.credentials}`,
        };

        // PUT/POST 请求需要 Content-Type
        if (method === 'PUT' || method === 'POST') {
            headers['Content-Type'] = 'application/octet-stream';
        }

        return headers;
    }

    // 列出目录内容
    async listDirectory(path = '') {
        try {
            const response = await fetch(`${this.baseUrl}/${path}`, {
                method: 'PROPFIND',
                headers: this.getHeaders('PROPFIND'),
                body: `<?xml version="1.0"?>
          <D:propfind xmlns:D="DAV:">
            <D:prop>
              <D:displayname/>
              <D:getcontentlength/>
              <D:getlastmodified/>
              <D:resourcetype/>
            </D:prop>
          </D:propfind>`,
            });

            if (!response.ok) {
                throw new Error(`WebDAV request failed: ${response.status}`);
            }

            const xmlText = await response.text();
            return this.parsePropfindResponse(xmlText);
        } catch (error) {
            console.error('WebDAV error:', error);
            throw error;
        }
    }

    // 解析 PROPFIND 响应
    parsePropfindResponse(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const responseNodes = xmlDoc.querySelectorAll('D\\:response, response');

        return Array.from(responseNodes).map(node => {
            const href = node.querySelector('D\\:href, href').textContent;
            const displayName = node.querySelector('D\\:displayname, displayname')?.textContent || '';
            const contentLength = node.querySelector('D\\:getcontentlength, getcontentlength')?.textContent || '0';
            const lastModified = node.querySelector('D\\:getlastmodified, getlastmodified')?.textContent || '';
            const isCollection = node.querySelector('D\\:collection, collection') !== null;

            return {
                href,
                displayName: displayName || href.split('/').pop(),
                size: parseInt(contentLength, 10),
                lastModified: new Date(lastModified),
                isDirectory: isCollection,
            };
        });
    }

    // 上传文件
    async uploadFile(file, remotePath) {
        try {
            const response = await fetch(`${this.baseUrl}/${remotePath}`, {
                method: 'PUT',
                headers: this.getHeaders('PUT'),
                body: file,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // 下载文件
    async downloadFile(remotePath) {
        try {
            const response = await fetch(`${this.baseUrl}/${remotePath}`, {
                method: 'GET',
                headers: this.getHeaders('GET'),
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            return response.blob();
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }

    // 删除文件或目录
    async delete(remotePath) {
        try {
            const response = await fetch(`${this.baseUrl}/${remotePath}`, {
                method: 'DELETE',
                headers: this.getHeaders('DELETE'),
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
}

// 使用示例
async function syncFiles() {
    const client = new WebDAVClient(
        'https://your-webdav-server.com/dav',
        'username',
        'password'
    );

    try {
        // 列出目录内容
        const files = await client.listDirectory();
        console.log('目录内容:', files);

        // 上传文件
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (file) {
            await client.uploadFile(file, `uploads/${file.name}`);
            console.log('文件上传成功');
        }

        // 下载文件
        const blob = await client.downloadFile('example.txt');
        const url = URL.createObjectURL(blob);
        window.open(url);

        // 删除文件
        await client.delete('example.txt');
        console.log('文件已删除');
    } catch (error) {
        console.error('同步失败:', error);
    }
}