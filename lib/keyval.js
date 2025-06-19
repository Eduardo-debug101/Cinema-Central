class Keyval {

    constructor(api_key) {
        this.api_key = api_key;
    }

    url_for(key) {
        // return `https://keyval.learnscrum.xyz/keystore/${key}?apikey=${this.api_key}`;
        return key;
    }

    // get(key, callback, error_callback = undefined) {
    //     //console.log("keyval get", key)
    //     fetch(this.url_for(key))
    //         .then(response => response.text())
    //         .then(data => callback(data))
    //         .catch(error => {
    //             if (error_callback !== undefined) {
    //                 error_callback(error);
    //             }
    //         });
    // }

    get(key, callback, error_callback = undefined) {
        try {
            const value = localStorage.getItem(key);
            // Simulate async callback
            setTimeout(() => callback(value), 0);
        } catch (error) {
            if (error_callback !== undefined) {
                error_callback(error);
            }
        }
    }


    // set(key, value, callback, error_callback = undefined) {
    //     //console.log("keyval set", key, value)
    //     fetch(this.url_for(key), {
    //         method: 'PUT',
    //         body: value
    //     })
    //         .then(response => response.text())
    //         .then(data => callback(data))
    //         .catch(error => {
    //             if (error_callback !== undefined) {
    //                 error_callback(error);
    //             }
    //         });
    // }

        set(key, value, callback, error_callback = undefined) {
        try {
            localStorage.setItem(key, value);
            // Simulate async callback
            setTimeout(() => callback(value), 0);
        } catch (error) {
            if (error_callback !== undefined) {
                error_callback(error);
            }
        }
    }
}