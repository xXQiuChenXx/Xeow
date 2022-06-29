module.exports = class Placeholder {
    #placeholders
    #Xeow
    constructor(Xeow) {
        this.#Xeow = Xeow
        this.#placeholders = {}
    }
    register(key, value) {
        if (this.#Xeow[key]) throw new Error("The placeholder already registered")
        this.#placeholders[key] = value
    }
    unregister(key) {
        delete this.#placeholders[key]
    }

    parse(text, { searchFor, replaceWith }) {
        if(searchFor && replaceWith) text = text.replace(`/${searchFor}/g`, replaceWith)
        Object.keys(this.#placeholders).filter(x => text.includes(x))
        .forEach(element => {
            text = text.replace(`/${element}/g`, eval(this.#placeholders[element]))
        });

    }
}