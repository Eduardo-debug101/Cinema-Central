class Experimental {
    static on() {
        localStorage.setItem("experimental", "true");
        window.location.reload();
    }

    static off() {
        localStorage.setItem("experimental", "false");
        window.location.reload();
    }

    static isOn() {
        let value = localStorage.getItem("experimental");
        return value === "true";
    }
}

class AsyncLoop {
    constructor(action, condition, delay = 100) {
        this.action = action;
        this.condition = condition;
        this.delay = delay;
        this.running = false;
    }

    start() {
        if (!this.running) this.#run();
    }

    stop() {
        this.running = false;
    }

    async #run() {
        this.running = true;
        while (this.running && (this.condition === true || this.condition())) {
            await this.action();
            if (this.delay) await this.#wait(this.delay);
        }
        this.running = false;
    }

    #wait(miliseconds) {
        return new Promise(resolve => setTimeout(resolve, miliseconds));
    }
}

/**
 * Creates element with specified parameters
 * @author Nischal Lawot
 */
class Element {
    /**
     * constructor for the element class
     * @param {string} tag - type of element to create
     * @param {*} parent - where the element should go
     * @param {string_array} classes - classes to add the element to
     * @param {dictionary} attributes - key value pairs
     * @author Nischal Lawot
     */
    constructor(tag, parent, classes, attributes) {
        let element = document.createElement(tag);
        this.element = element;
        if (parent) {
            this.setParent(parent);
        }
        if (classes) {
            this.addClasses(classes);
        }
        if (attributes) {
            this.setAttributes(attributes)
        }
    }

    /**
     * parses array of classes to add to the element
     * @param {array} classNames - array off classes to add
     * @author Nischal Lawot
     */
    addClasses(classNames) {
        classNames = Array.isArray(classNames) ? classNames : [classNames];
        for (let className of classNames) {
            this.addClass(className);
        }
    }

    /**
     * adds a class to the element
     * @param {string} className - singular class to add
     * @author Nischal Lawot
     */
    addClass(className) {
        this.appendAttribute("class", className, " ");
    }

    /**
     * removes a class to the element
     * @param {string} className - singular class to add
     * @author Nischal Lawot
     */
    removeClass(className) {
        let oldValue = this.element.getAttribute("class");
        let newArray;
        if (oldValue) {
            let array = oldValue.split(" ");
            let newArray = array.filter(name => name !== className);
            newArray = array.join(" ");
        } else {
            newArray = value;
        }
        this.setAttribute("class", newArray);
    }

    /**
     * parses array of attributes to add to element
     * @param {dictionary} attributes - key value pairs of attributes for the element
     * @author Nischal Lawot
     */
    setAttributes(attributes) {
        for (let attribute in attributes) {
            this.setAttribute(attribute, attributes[attribute]);
        }
    }

    /**
     * Adds more content to the end of an attribute rather then reseting it.
     * @param {string} name - the name of the attribute
     * @param {string} value - the value of the attribute
     * @param {string} separationCharacter - the attribute
     */
    appendAttribute(name, value, separationCharacter = "") {
        let oldValue = this.element.getAttribute(name);
        let newArray;
        if (oldValue) {
            let array = oldValue.split(separationCharacter);
            array.push(value);
            newArray = array.join(separationCharacter);

        } else {
            newArray = value;
        }
        this.setAttribute(name, newArray);
    }

    /**
     * Sets the attribute to the element
     * @param {string} name - attribute name
     * @param {string} value - attribute value
     * @author Nischal Lawot
     */
    setAttribute(name, value) {
        this.element.setAttribute(name, value);
    }

    /**
     * parses array and adds the children to the element
     * @param {*} arrayOfChildren - adds children to the element
     * @author Nischal Lawot
     */
    addChildren(arrayOfChildren) {
        for (let child in arrayOfChildren) {
            this.addChild(child);
        }
    }

    /**
     * adds child to element
     * @param {*} child - element to add as a child
     * @author Nischal Lawot
     */
    addChild(child) {
        this.element.appendChild(child instanceof Element ? child.element : child);
    }

    /**
     * clears inner html of element
     * @author Nischal Lawot
     */
    clear() {
        this.element.innerHTML = "";
    }

    /**
     * Removes element from page
     */
    remove() {
        this.element.remove()
    }

    /**
     * adds element as child of the parent
     * @param {*} parent - parent to add element to
     * @author Nischal Lawot
     */
    setParent(parent) {
        (parent instanceof Element ? parent.element : parent).appendChild(this.element);
    }
}

class ImageElement extends Element {
    constructor(parent, image, defaultImage, classes, attributes) {
        super("img", parent, classes, attributes);
        this.setAttribute("src", image);
        this.element.addEventListener(
            "error",
            () => this.setAttribute("src", defaultImage),
            { once: true }
        );

    }
}

/**
 * Creates a text element and adds in text
 * @extends Element
 * @author Nischal Lawot
 */
class TextElement extends Element {
    /**
     * create Element with a text quality
     * @param {string} text - text to add in element
     * @param {string} tag - type of element to create
     * @param {*} parent - where the element should go
     * @param {string_array} classes - classes to add the element to
     * @param {dictionary} attributes - key value pairs
     * @author Nischal Lawot
     */
    constructor(text, tag, parent, classes, attributes) {
        super(tag, parent, classes, attributes);
        this.addChild(document.createTextNode(text));
    }
}

class TextLink extends TextElement {
    constructor(text, parent, href, classes, attributes) {
        super(text, "a", parent, classes, attributes);
        this.setAttribute("href", href);
    }
}

/**
 * create a button from TextElement
 * @extends TextElement
 * @author Nischal Lawot
 */
class ClickableElement extends Element {
    /**
     * create a button element
     * @param {string} text - text to add in element
     * @param {string} tag - the tag name
     * @param {*} parent - where the element should go
     * @param {string_array} classes - classes to add the element to
     * @param {dictionary} attributes - key value pairs
     * @param {function} onClick - function to occur when element is clicked
     * @author Nischal Lawot
     */
    constructor(tag, parent, classes, attributes, onClick) {
        super(tag, parent, classes, attributes);
        if (onClick) {
            this.setOnClick(onClick);
        }
    }

    /**
     * sets value for when the button is clicked
     * @param {function} callback - function to be called when clicked
     * @author Nischal Lawot
     */
    setOnClick(callback) {
        this.element.addEventListener("click", callback);
    }
}

/**
 * create a button from TextElement
 * @extends TextElement
 * @author Nischal Lawot
 */
class ClickableTextElement extends TextElement {
    /**
     * create a button element
     * @param {string} text - text to add in element
     * @param {string} tag - the tag name
     * @param {*} parent - where the element should go
     * @param {string_array} classes - classes to add the element to
     * @param {dictionary} attributes - key value pairs
     * @param {function} onClick - function to occur when element is clicked
     * @author Nischal Lawot
     */
    constructor(text, tag, parent, classes, attributes, onClick) {
        super(text, tag, parent, classes, attributes);
        if (onClick) {
            this.setOnClick(onClick);
        }
    }

    /**
     * sets value for when the button is clicked
     * @param {function} callback - function to be called when clicked
     * @author Nischal Lawot
     */
    setOnClick(callback) {
        this.element.addEventListener("click", callback);
    }
}

/**
 * create a button from TextElement
 * @extends TextElement
 * @author Nischal Lawot
 */
class Button extends ClickableTextElement {
    /**
     * create a button element
     * @param {string} text - text to add in element
     * @param {*} parent - where the element should go
     * @param {string_array} classes - classes to add the element to
     * @param {dictionary} attributes - key value pairs
     * @param {function} onClick - function to occur when element is clicked
     * @author Nischal Lawot
     */
    constructor(text, parent, classes, attributes, onClick) {
        super(text, "button", parent, classes, attributes, onClick);
    }
}

/**
 * Create drop down menu
 * @extends Element
 * @author Nischal Lawot
 */
class SimpleDropDown extends Element {
    /**
     * create a dropdown element
     * @param {*} parent - where should the element go
     * @param {dictionary} options - array of options for the dropdown to list
     * @param {function} onSelect - action to do when selected
     * @param {array, strings} classes - classes to add element to
     * @param {dictionary} attributes - key value pairs of attributes
     * @author Nischal Lawot
     */
    constructor(parent, options, onSelect, classes, attributes) {
        super("select", parent, classes, attributes);
        this.element.addEventListener("change", () => onSelect(this.element.value));

        if (options) {
            for (let option in options) {
                this.createOption(option, options[option]);
            }
        }
    }

    /**
     * create an option in the dropdown
     * @param {string} text
     * @author Nischal Lawot 
     */
    createOption(text, value) {
        let option = new TextElement(text, "option", this.element, undefined, { value: value });
    }
}

/**
 * Create a deck of elements
 * @extends Element
 * @author Nischal Lawot
 */
class Deck extends Element {
    /**
     * create a deck
     * @param {*} parent - where should the deck go
     * @param {string} [defaultImage="Loading_Placeholder.png"] - image must be from assets folder
     * @param {*} attributes - atributes for deck
     * @param {any[]} [classes=[]] - classes for deck
     */
    constructor(parent, defaultImage = "assets/Loading_Placeholder.png", classes = [], attributes) {
        super("div", parent, ["card-deck", "default"], attributes);
        this.setDefaultImage(defaultImage)
        this.addClasses(classes)
    }

    /**
     * add a card to the deck element
     * @param {*} text - text to add to card
     * @param {*} image - image for the card
     * @param {*} link - where should the card link
     * @param {*} onClick - what happen on click
     * @author Nischal Lawot
     */
    addCard(text, image, link, onClick) {
        let parent = this.element;
        let cardLink = new Element("a", parent, ["card-link", "card-container"], { "href": link });
        let card = new Element("div", cardLink, "card");
        let poster = new ImageElement(card, image, this.defaultImage, "image");
        let titleContainer = new Element("div", card, "title-container");
        let title = new TextElement(text, "div", titleContainer, "title");

        if (onClick) {
            cardLink.element.addEventListener("click", onClick);
        }
    }

    /**
     * 
     * @param {string} image - image must be from assets folder
     */
    setDefaultImage(image) {
        if (image) {
            this.defaultImage = "assets/" + image;
            this.appendAttribute("style", `--card-default-image: url("../assets/${image}");`);
        }
    }
}

/**
 * Create a horizontal deck of elements
 * @extends Deck
 * @author Nischal Lawot
 */
class HorizontalDeck extends Deck {
    /**
     * create a deck
     * @param {*} parent - where should the deck go
     * @param {string} defaultImage - image must be from assets folder
     * @param {*} attributes - atributes for deck
     * @param {any[]} [classes=[]] - classes for deck
     */
    constructor(parent, defaultImage, classes = [], attributes) {
        super(parent, defaultImage, "flex", attributes);
        this.addClasses(classes)
    }
}

class NavigationBar extends Element {
    /**
     * name of item type to its corresponding method
     */
    itemTypes = {
        link: this.createLinkItem,
        button: this.createButtonItem,
        plain: this.createPlainItem,
        filler: this.createFillerItem // fills up un-used space
    }
    /**
     * name of content type to its corresponding method
     */
    contentTypes = {
        image: this.createImageContent,
        text: this.createTextContent,
        none: undefined
    }

    constructor(parent, activeItemId, itemJson = {}, classes, attributes) {
        super("div", parent, classes, attributes);
        this.activeItem = activeItemId;
        this.items = {};
        this.hiddenItems = [];
        this.addItems(itemJson);
    }

    /**
     * Creates an Navbar item
     * @param {string} id - id for item
     * @param {string} itemType - link, button, plain or filler
     * @param {string} contentType  - image, text or none
     * @param {string} content - image filepath, or text based on content type
     * @param {string or function} effect - link or callback function based on item type
     * @param {dictionary} itemAttributes - dictionary of attributes for content element 
     * @param {dictionary} contentAttributes - dictionary of attributes for item element
     */
    addItem(id, itemType, contentType, content, effect, itemAttributes, contentAttributes) {
        let item = this.itemTypes[itemType](effect);// uses the dictionary to find the corresponding method
        item.setAttributes(itemAttributes)
        this.addChild(item);
        if (contentType && contentType !== "none") {
            let contentElement = this.contentTypes[contentType](content);
            item.addChild(contentElement);
            if (contentType === "image") {
                item.addClass("image-container");
                item.setAttributes(contentAttributes)
            } else if (contentType === "text") {
                item.addClass("text-container");
            }
        }
        this.items[id] = item;
    }

    addItems(json) {
        for (let id in json) {
            let item = json[id];
            this.addItem(id, item.itemType, item.contentType, item.content, item.effect, item.itemAttributes, item.contentAttributes);
        }
    }

    removeItem(id) {
        this.item[id].remove();//deletes item from page
        delete this.items[id];//removes item from list
    }

    hideItem(id) {
        this.items[id].addClass("hidden");
        this.hiddenItems = this.hiddenItems.filter(string => string !== id);
    }

    showItem(id) {
        this.items[id].removeClass("hidden");
        this.hiddenItems.push(id);
    }

    getHiddenItems() {
        return this.hiddenItems;
    }

    showHiddenItems() {
        let items = this.hiddenItems
        for (let id of this.hiddenItems) {
            this.showItem(id);
        }
    }

    setContent(id, contentType, content) {
        if (contentType !== "none") {
            let item = this.items[id];
            item.clear();
            let contentElement = this.contentTypes[contentType](content);
            item.addChild(contentElement);
        }
    }

    getItem(id) {
        return this.items[id];
    }

    setActiveItem(id) {
        let activeItem = this.items[this.activeItem];
        if (activeItem) {
            activeItem.removeClass("active");
        }
        let item = this.items[id];
        if (item) {
            item.addClass("active");
        }
    }

    createLinkItem(link) {
        let item = new Element("a", undefined, "link", { href: link });
        return item;
    }

    createButtonItem(onClick) {
        let item = new ClickableElement("div", undefined, "button", undefined, onClick);
        return item;
    }

    createPlainItem() {
        let item = new Element("div");
        return item;
    }

    createFillerItem() {
        let item = new Element("div", undefined, "filler");
        return item
    }

    createTextContent(text) {
        return document.createTextNode(text);
    }

    createImageContent(imageFile) {
        let content = new ImageElement(undefined, imageFile);
        return content;

    }
}