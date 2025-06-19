class MessageElement extends ThreadManager {
    constructor(list, form) {
        super();
        this.listElement = list;
        this.formElement = form;
        this.setOnUpdate(this.loadMessages.bind(this));
        this.numberOfMessages = 0;
    }

    clearPage() {
        this.numberOfMessages = 0;
        this.listElement.innerHTML = "";
    }

    loadMessages() {
        let elem = this.listElement;
        let scroll = false;
        if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) scroll = true;
        let messages = this.getMessages();
        let numberOfNewMessages = messages.length;
        if (numberOfNewMessages < this.numberOfMessages) this.clearPage();
        if (numberOfNewMessages <= this.numberOfMessages) return;
        if (this.numberOfMessages === 0) elem.innerHTML = "";

        for (let i = this.numberOfMessages; i < numberOfNewMessages; i++) {
            let message = messages[i];
            this.numberOfMessages++;
            let messageText = message.message;
            //console.log(message)
            let messageAuthor = message.username ? message.username : "Anonymous";
            let element = new TextElement(`${messageAuthor} | ${messageText}`, "div", this.listElement);
        }
        if (scroll) {
            elem.scrollTop = elem.scrollHeight;
        }
    }

    async openThread(id) {
        await super.openThread(id);
        this.loadMessages();

        let messageInput = document.querySelector(".message-form .message");
        let send = document.querySelector(".send");

        send.addEventListener("click", async () => {
            let message = messageInput.value;
            await this.sendMessage(message);
            this.loadMessages()
            messageInput.value = "";
        })

        let clear = document.querySelector(".clear");

        if (clear) clear.addEventListener("click", async () => {
            this.clearMessages();
            this.clearPage();
        })

        messageInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                let message = messageInput.value;
                await this.sendMessage(message);
                this.loadMessages()
                messageInput.value = "";
            }
        })
        let elem = this.listElement;
        elem.scrollTop = elem.scrollHeight;
        //this.clearMessages();
        //this.sendMessage("Hello World")
    }
}
let messageList = document.querySelector(".messages");
async function mSetup() {
    const urlParams = new URLSearchParams(window.location.search);
    let perams = Object.fromEntries(urlParams.entries());
    let title = perams.title;
    let id = perams.id;

    if (!id || !title) {
        window.location.replace("index.html");
    }
    let discusName = document.querySelector(".title");
    discusName.innerHTML = title + " Discussion";


    let formList = document.querySelector(".message-form");
    let messageElement = new MessageElement(messageList, formList);
    await messageElement.openThread(id)
}

mSetup();

//messageElement.openThread("1");