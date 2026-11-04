export function googlePopupLogin(apiBaseUrl) {
    return new Promise((resolve, reject) => {
        const popup = window.open(
            `${apiBaseUrl}/auth/google/login`,
            'googleLogin',
            'width=500,height=600'
        );

        function handleMessage(event) {
            const origin = new URL(apiBaseUrl).origin;
            if (event.origin !== origin) return;

            if (event.data && event.data.accessToken) {
                // Clear popup check BEFORE resolving
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', handleMessage);

                try {
                    popup.close();
                } catch (e) {
                    // Ignore
                }

                resolve({ data: event.data }); // Axios-style response
            }
        }

        window.addEventListener('message', handleMessage);

        const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', handleMessage);
                reject(new Error('Popup closed by user'));
            }
        }, 500);
    });
}

export function socialPopupLogin(provider, apiBaseUrl) {
    return new Promise((resolve, reject) => {

        const width = 500;
        const height = 600;
        const top = 0;
        const left = window.screen.width - width;

        const popup = window.open(
            `${apiBaseUrl}/auth/${provider}/login`,
            `${provider}Login`,
            `width=${width},height=${height},top=${top},left=${left}`
        );

        function handleMessage(event) {
            const origin = new URL(apiBaseUrl).origin;
            if (event.origin !== origin) return;

            if (event.data && event.data.accessToken) {
                // Clear popup check BEFORE resolving
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', handleMessage);

                try {
                    popup.close();
                } catch (e) {
                    // Ignore
                }

                resolve({ data: event.data }); // Axios-style response
            }
        }

        window.addEventListener('message', handleMessage);

        const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', handleMessage);
                reject(new Error('Popup closed by user'));
            }
        }, 500);
    });
}