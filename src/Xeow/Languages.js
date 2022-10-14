const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const path = require("path");
const fs = require("fs").promises;
const DiscordLanguage = ['da', 'vi', 'en-US', 'lt', 'cs', 'nl', 'hi', 'fr', 'sv-SE', 'ja', 'uk', 'tr', 'th', 'he', 'zh-CN', 'bg', 'pt-BR', 'hr', 'ar', 'ko', 'es-ES', 'el', 'it', 'de', 'ru', 'ro', 'pl', 'fi', 'en-GB', 'no', 'hu', 'zh-TW']

class Language {
	async init(config) {
		const options = {
			jsonIndent: 2,
			loadPath: path.resolve(__dirname, "../../languages/{{lng}}/{{ns}}.json")
		};

		const { namespaces, languages } = await this.walkDirectory(
			path.resolve(__dirname, "../../languages/")
		);
		this.languages = languages

		i18next.use(Backend);

		await i18next.init({
			backend: options,
			debug: false,
			fallbackLng: [ config.Lang, ...config.SupportedLang ],
			initImmediate: false,
			interpolation: { escapeValue: false },
			load: "all",
			ns: namespaces,
			preload: languages,
			saveMissing: true
		});

		i18next.on('missingKey', function (lngs, namespace, key, res) {
			console.warn(`Missing key in ${namespace} file ${lngs} language at ${key}`)
		})
		i18next.on('failedLoading', function(lng, ns, msg) {
			console.warn(`Failed to load ${lng} in ${ns}, reason: ${msg}`)
		})

	}

	getTranslationsForKey(key) {
		return i18next.languages.reduce((messages, currentLang) => {
			if (DiscordLanguage.includes(currentLang)) {
				messages[currentLang] = i18next.t(key, { lng: currentLang });
			}
			return messages
		}, {})
	}

	translation() {
		return new Map(this.languages.map(item => [item, i18next.getFixedT(item)]));
	}

	async walkDirectory(dir, namespaces = [], folderName = "") {
		const files = await fs.readdir(dir);

		const languages = [];
		for (const file of files) {
			const stat = await fs.stat(path.join(dir, file));
			if (stat.isDirectory()) {
				const isLanguage = file.includes("-");
				if (isLanguage) languages.push(file);

				const folder = await this.walkDirectory(
					path.join(dir, file),
					namespaces,
					isLanguage ? "" : `${file}/`
				);

				namespaces = folder.namespaces;
			} else {
				namespaces.push(`${folderName}${file.substr(0, file.length - 5)}`);
			}
		}

		return { namespaces: [...new Set(namespaces)], languages };
	}
}

module.exports = Language
