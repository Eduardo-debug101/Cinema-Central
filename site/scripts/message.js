
/*
//keval Structure
    //keeps track of all message threads (one in keval to keep track of all message threads, and another in each users profile page to keep track of all message threads they are participating in)
    "messageThreadIds":[ 
        "messageThread-1"
    ]

    //example thread
    "messageThread-1": {
        "type": private;//public or private

        "users": [
            "exampleId-1",
            "exampleId-2"
        ],

        "active": { // if there is active user in thread decrease data retreve delay in asyncLoop (example from 2mins to 30 seconds)
            "exampleId-1": {
                "lastUpdate": TIMESTAMP, // Next user to retrieve data will auto delete active users that have not receved an update for longer than 2mins
                "isTyping": BOOLEAN, // decrease data retreve delay further (example from 30secs to 10secs)
            }
        },

        "messages": [
            [
                "author": "exampleId-1",
                "timeStamp": TIMESTAMP,
                "message": "Some message"
            ],

            [
                "author": exampleId-2,
                "timeStamp": TIMESTAMP,
                "message": "Some message"
            ],
        ],
    }
*/

class UserUtil {
    static getCurrentId() {
        let id = localStorage.getItem("logged_in_user");
        if (!id) return false;

        return "user-" + id;
    }

    static getUsername() {
        let name = localStorage.getItem("logged_in_username");
        if (!name) return false;

        return name;
    }
}

class TimeUtil {
    static getTimeStamp() {
        let currentTime = new Date(Date.now())
        return currentTime.toISOString();
    }

    static getTimeDif(date1, date2) {
        date1 = new Date(date1);
        date2 = new Date(date2);
        return Math.abs(date2 - date1) / 1000;
    }
}

/**
 * Array utility functions
 */
class ArrayUtil {
    /**
     * Prevents Array appending errors
     * @param {Array} array the array you want the item added to
     * @param {*} item the item you want added to array
     * @returns 
     */
    static append(array, item) {
        if (!Array.isArray(array)) return false;
        return array.concat(item);
    }

    static remove(array, value) {
        if (!Array.isArray(array)) return false;
        return array.filter(item => item !== value)
    }
}

/**
 * Json utility functions
 */
class JsonUtil {
    /**
     * Checks whether variable is object
     * @param {*} object variable being checked
     * @returns boolean
     */
    static isObject(object) {
        return typeof object === "object";
    }

    /**
     * Prevents json parsing errors
     * @param {JSON} json json string that needs to be parsed
     * @returns parsed string or false if there is an error
     */
    static parse(json) {
        let object;
        try {
            object = JSON.parse(json);
        } catch (error) {
            //console.log(error);
            return false;
        }
        return object;
    }

    /**
     * Prevents json stringify errors
     * @param {JSON} object object that needs to be converted to string
     * @returns parsed string or false if there is an error
     */
    static stringify(object) {
        if (!this.isObject) return object;
        let json = JSON.stringify(object);
        return json;
    }
}

class ObjectUtil {

    static get(reference, path) {
        path = this.#readPath(path);
        let closeReference = this.#getReference(reference, path);
        if (!closeReference) return false;
        let item = path.pop();
        return closeReference[item];
    }

    static set(reference, path, value) {
        path = this.#readPath(path);
        let closeReference = this.#getReference(reference, path);
        if (!closeReference) return false;
        let item = path.pop();
        closeReference[item] = value;
        return reference;
    }

    static delete(reference, path) {
        path = this.#readPath(path);
        let closeReference = this.#getReference(reference, path);
        if (!closeReference) return false;
        let item = path.pop();
        delete closeReference[item];
    }

    static #readPath(path) {
        if (typeof path === "string") {
            path = path.split("/");
        }
        return path;
    }

    static #getReference(movingRef, path) {
        let len = path.length - 1;
        for (let i = 0; i < len; i++) {
            let elem = path[i];
            movingRef = movingRef[elem];
            if (!movingRef) return false;
        }
        return movingRef;
    }
}

// class ConflictManager {
//     constructor() {
//         this.taskInProgress = false;
//         this.listener = new CustomEvent("endTask");
//     }

//     async waitForTasks() {
//         if (!this.taskInProgress) return true;

//         return new Promise((resolve) => {
//             console.log(addEventListener, this.listener)
//             addEventListener('endTask', () => {

//                 resolve();
//             }, { once: true });
//         });
//     }

//     startTask() {
//         this.taskInProgress = true;
//         this.abortController = new AbortController();
//     }

//     endTask() {
//         this.taskInProgress = false;
//         this.listener.dispatchEvent(this.listener);
//     }
// }

class AsyncKeyval extends Keyval {
    constructor() {
        super();
    }
    async set(key, value) {
        value = JsonUtil.stringify(value);
        return new Promise((resolve) => super.set(key, value, resolve));
    }

    async get(key) {
        let promise = new Promise((resolve) => super.get(key, resolve));
        let result = await promise;
        return JsonUtil.parse(result);
    }
}

class UserPropertyManager extends AsyncKeyval {
    constructor(userId) {
        super();
        this.userId = userId;
    }

    async getUserProperty(id = this.userId, name) {
        let user = await this.get(id);
        user = ObjectUtil.get(user, "user_info/0");
        if (!user) return false;

        return user[name] ? user[name] : false;
    }

    async setUserProperty(id = this.userId, name, value) {
        let user = await this.get(id);
        ObjectUtil.set(user, "user_info/0/" + name, value);
        if (!user) return false;

        await this.set(id, user);
        return true;
    }

    async appendUserProperty(id = this.userId, name, value) {
        let property = await this.getUserProperty(id, name);
        if (!property) property = [];

        let newProperty = ArrayUtil.append(property, value);
        if (!newProperty) return false;

        return await this.setUserProperty(id, name, newProperty);
    }
}

class UserThreadListManager extends UserPropertyManager {
    constructor(userId) {
        super(userId);
    }

    async getUserThreads(id) {
        return await this.getUserProperty(id, "messageThreads");
    }

    async setUserThreads(id, threadIdList) {
        return await this.setUserProperty(id, "messageThreads", threadIdList)
    }

    async clearUserThreads(id) {
        return await this.setUserThreads(id, [])
    }

    async removeUserThread(id, threadId) {
        let threadList = await this.getUserThreads(id);
        if (!threadList) return false;

        let newThreadList = ArrayUtil.remove(threadList, threadId);
        if (!newThreadList) return false;

        return await this.setUserThreads(id, newThreadList);
    }

    async appendUserThreads(id, threadId) {
        return await this.appendUserProperty(id, "messageThreads", threadId);
    }

}

class ThreadListManager extends AsyncKeyval {
    constructor() {
        super();
    }

    async getAvailableThreadId() {
        let ids = await this.getThreadIds();
        return ids.length;
    }

    async getThreadIds() {
        let threads = await this.get("messageThreadIds");
        if (!threads) return false;

        return threads;
    }

    async setThreadIds(idList) {
        await this.set("messageThreadIds", idList);
        return true;
    }

    async removeThreadId(id) {
        //messes up current id system
        let threadIdList = await this.getThreadIds();
        if (!threadIdList) return false;

        let newThreadIdList = ArrayUtil.remove(threadIdList, id);
        return await this.setThreadIds(newThreadIdList);
    }

    async appendThreadId(id) {
        let threadIdList = await this.getThreadIds();
        if (!threadIdList) return false;

        let newThreadIdList = ArrayUtil.append(threadIdList, id);
        return await this.setThreadIds(newThreadIdList);
    }

    async clear() {
        await this.setThreadIds([]);
    }
}

class ThreadInstanceManager extends AsyncKeyval {
    constructor() {
        super();
    }

    async getThread(id) {
        let thread = await this.get("thread-" + id);
        if (!thread) return false;

        return thread;
    }

    async setThread(id, thread) {
        await this.set("thread-" + id, thread);
        return true;
    }

    async createThread(id, user_ids, type = "private", link = "none") {
        let thread = {
            id: id,
            type: type,
            linkId: link,
            users: user_ids,
            activeUsers: {},
            messages: []
        };
        return await this.setThread(id, thread);
    }
}

class ThreadInstancePropertyManager extends ThreadInstanceManager {
    constructor() {
        super();
    }

    async setId(id) {
        this.id = id;
        await this.pullThread(id);
    }

    async pullThread() {
        let id = this.id;
        let thread = await this.getThread(id);
        if (!thread) return false;

        this.currentThread = thread;
    }

    async pushThread() {
        let id = this.id;
        let thread = this.currentThread;
        if (!thread) return false;

        return await this.setThread(id, thread);
    }

    getThreadProperty(property) {
        return ObjectUtil.get(this.currentThread, property)
    }

    setThreadProperty(property, value) {
        let result = ObjectUtil.set(this.currentThread, property, value);
    }

    removeThreadProperty(property) {
        ObjectUtil.delete(this.currentThread, property);
    }

    appendThreadProperty(property, value) {
        let currentArray = this.getThreadProperty(property);
        let newArray = ArrayUtil.append(currentArray, value);
        this.setThreadProperty(property, newArray);
    }
}

class ThreadInstanceControlManager extends ThreadInstancePropertyManager {
    constructor() {
        super();
        this.push = false;
    }

    async getUsers() {
        return this.getThreadProperty("users");
    }

    async addUser(userId, push = this.push) {
        this.appendThreadProperty("users", userId);
        if (push) return await this.pushThread();
    }

    async removeUser(userId, push = this.push) {
        let currentArray = this.getThreadProperty("users");
        let newArray = ArrayUtil.remove(currentArray, userId);
        this.setThreadProperty("users", newArray);
        if (push) return await this.pushThread();
    }

    async addActiveUser(userId, push = this.push) {
        this.setThreadProperty(["activeUsers", userId], {
            "lastUpdate": TimeUtil.getTimeStamp(),
            "isTyping": false,
        });
        if (push) return await this.pushThread();
    }
    async removeActiveUser(userId, push = this.push) {
        this.removeThreadProperty(["activeUsers", userId]);
        if (push) return await this.pushThread();
    }

    getTimeStamp(userId) {
        return this.getThreadProperty(["activeUsers", userId, "lastUpdate"]);
    }

    async updateTimeStamp(userId, push = this.push) {
        this.setThreadProperty(["activeUsers", userId, "lastUpdate"], TimeUtil.getTimeStamp());
        if (push) return await this.pushThread();
    }



    async removeActiveUsers(userIds, push = this.push) {
        for (let id of userIds) {
            this.removeThreadProperty(["activeUsers", id]);
        }
        if (push) return await this.pushThread();
    }

    async setIsTyping(userId, bool, push = this.push) {
        this.setThreadProperty(["activeUsers", userId, "isTyping"], bool);
        if (push) return await this.pushThread();
    }

    verifyActiveUser(userId) {
        let currentTime = TimeUtil.getTimeStamp();
        let userTime = this.getTimeStamp(userId);
        let timeDif = TimeUtil.getTimeDif(currentTime, userTime);
        return timeDif > 120;//seconds
    }

    async removeInactiveUsers(excludedUser, push = this.push) {
        let users = this.getThreadProperty("activeUsers");
        let inactiveUsers = [];
        let userIds = Object.keys(users);
        userIds = ArrayUtil.remove(userIds, excludedUser);
        for (let id of userIds) {
            if (this.verifyActiveUser(id)) {
                inactiveUsers.push(id);
            }
        }
        await this.removeActiveUsers(inactiveUsers, push);
    }

    async createMessage(authorId, message, push = this.push, username) {
        this.appendThreadProperty("messages", {
            author: authorId,
            username: username,
            timeStamp: TimeUtil.getTimeStamp(),
            message: message,
        });
        if (push) return await this.pushThread();
    }


}

class ThreadManager {
    constructor() {
        this.userManager = new UserThreadListManager();
        this.listManager = new ThreadListManager();
        this.instanceManager = new ThreadInstanceControlManager();

        this.messages = [];
        this.activeThread = false;
        this.userId = UserUtil.getCurrentId();
        this.username = this.userId ? UserUtil.getUsername() : "";
        this.onUpdate = () => console.log("no update");

    }

    setOnUpdate(callback) {
        this.onUpdate = callback;
    }

    clearMessages() {
        this.instanceManager.setThreadProperty("messages", []);
        this.instanceManager.pushThread();
    }

    async getUserThreads() {
        return await this.userManager.getUserThreads(userId);
    }

    getMessages() {
        return this.instanceManager.getThreadProperty("messages");
    }

    async sendMessage(message) {
        this.updating = await this.instanceManager.createMessage(this.userId, message, true, this.username);
    }

    getOpenThreadId() {
        return this.activeThread;
    }

    async openThread(id) {
        this.activeThread = id;
        let thread = await this.instanceManager.getThread(id)
        if (thread) {
            console.log("-----------------------------")
        } else {
            await this.instanceManager.createThread(id, [], "", "")
        }
        await this.instanceManager.setId(id);
        // await this.instanceManager.addActiveUser(this.userId);
        // await this.instanceManager.pushThread();

        this.updater = new AsyncLoop(this.updateThread.bind(this), true, 1000);
        this.updater.start()
        return true;

    }

    async updateThread() {
        if (!this.openThread) return false;

        await this.instanceManager.pullThread();
        // await this.instanceManager.removeInactiveUsers(this.userId, false);
        // await this.instanceManager.updateTimeStamp(false);
        // await this.instanceManager.pushThread();

        if (this.onUpdate) this.onUpdate();
    }

    async closeThread() {
        await this.instanceManager.removeActiveUser(this.userId);
        this.updater.stop();
        this.activeThread = false;
    }

    async createThread(userIds, type, linkId) {
        let threadId = await this.listManager.getAvailableThreadId();
        await this.listManager.appendThreadId(threadId);
        for (let userId of userIds) {
            await this.userManager.appendUserThreads(userId, threadId);
        }
        await this.instanceManager.createThread(threadId, userIds, type, linkId);
    }

    async clearAllThreads() {
        let threadIds = await this.listManager.getThreadIds();
        await this.listManager.clear();
        for (let threadId of threadIds) {
            await this.instanceManager.setId(threadId);
            let usersIds = await this.instanceManager.getUsers();
            for (let userId of usersIds) {
                await this.userManager.clearUserThreads(userId);
            }
        }
    }

    async deleteThread(threadId) {
        await this.instanceManager.setId(threadId);
        let userIds = await this.instanceManager.getUsers(threadId);
        for (let userId of userIds) {
            await this.userManager.removeUserThread(userId, threadId);
        }
    }

}
let t = new ThreadManager();
window.addEventListener("load", async () => {
    //console.clear();
    //let user = "user-" + localStorage.getItem("logged_in_user");
    //let t = new ThreadManager();
    //let c = new ConflictManager();
    //t.openThread(1);

    // console.log(await c.waitForTasks(), 1);
    // c.startTask();
    // console.log(await c.waitForTasks(), 2);
    // console.log(3)
    // c.endTask();
    //await t.clearAllThreads();
    //await t.createThread(["user-6", "user-7"], "t1");
    //await t.deleteThread(1);

    //await t.createThread(1, [])
    //await t.setId(1);
    //await t.removeInactiveUsers();
    //await t.createMessage("user-1", "hi")

    //await t.addActiveUser("user-1");
    //await t.addActiveUser("user-2");
    //await t.setIsTyping("user-1", true);

    //await t.pullThread()
    // console.log(t.currentThread)
    //t.appendThreadProperty("users", "none")
    //console.log(t.currentThread)
    //t.pushThread();
    //t.createThread(1, [], "public", "someName");
    //u.removeUserThread(undefined, "1234")
})

//idk.pullIds();

class MessageThread {// will extends from MessageElement
    constructor() {
        this.json = {};
        //this.updater = new AsyncLoop(this.refresh.bind(this), true, 60000);
        //this.updater.start();
    }

    /**
     * Creants new thread
     * @param {*} id 
     * @param {*} usersids 
     */
    create(id, usersIds) {
        //get user profile jsons and adds message id to their message list
        //creates a new thread instance following the template at the top of the page
        //call open method
    }

    /**
     * Opens new thread
     * @param {*} id 
     */
    open(id) {
        //call retrieveKeval
        //adds user to active users
        //call updateActiveUsers method
        //call updateKeval method
    }

    refresh() {
        //call retrieveKeval
        //call updateActiveUsers method
        //call updateKeval method
        //call updateMessages methods
    }

    closeThread() {
        //removes user from active list
        //call updateKeval method
    }

    updateMessages() {
        //if message list is longer than before
        //adds newMessage to the page
    }

    updateActiveUsers() {
        //update active timestamp
        //removes any users from active list who have been inactive for lonager the set time (example 2mins)
        //set is typing to true or false depending on wether the user is typeing
    }

    createMessage(message) {
        /**
         * create message with this format
         * [
         *  "author": exampleId-2,
         *  "timeStamp": TIMESTAMP,
         *  "message": "Some message"
         * ]
         * adds it to message list
         * call updateKeval method
         * adds it to the page
         */
    }

    retrieveKeval() {
        //retrieves data from keval and sets it to this.json
    }

    updateKeval() {
        //posts the new modified json
    }
}