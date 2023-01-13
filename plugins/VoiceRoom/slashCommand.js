module.exports = function (Xeow) {
    const tr = Xeow.native("app_commands/vc")
    const trA = Xeow.nativeA("app_commands/vc")
    return {
        name: tr("name"),
        description: tr("description"),
        descriptionLocalize: trA("description"),
        options: [{
            name: "set-main",
            description: tr("opts:setMain:description"),
            descriptionLocalize: trA("opts:setMain:description"),
            type: 1,
            options: [{
                name: tr("opts:setMain:opts:channel:name"),
                description: tr("opts:setMain:opts:channel:description"),
                descriptionLocalize: trA("opts:setMain:opts:channel:description"),
                type: 7,
                required: true
            }],
        }, {
            name: "help",
            description: tr("opts:help:description"),
            descriptionLocalize: trA("opts:help:description"),
            type: 1
        }, {
            name: "info",
            description: tr("opts:info:description"),
            descriptionLocalize: trA("opts:info:description"),
            type: 1
        }, {
            name: "invite",
            description: tr("opts:invite:description"),
            descriptionLocalize: trA("opts:invite:description"),
            type: 1
        }, {
            name: "lock",
            description: tr("opts:lock:description"),
            descriptionLocalize: trA("opts:lock:description"),
            type: 1
        }, {
            name: "unlock",
            description: tr("opts:unlock:description"),
            descriptionLocalize: trA("opts:unlock:description"),
            type: 1
        }, {
            name: "rename",
            description: tr("opts:rename:description"),
            descriptionLocalize: trA("opts:rename:description"),
            type: 1,
            options: [{
                name: tr("opts:rename:opts:name"),
                description: tr("opts:rename:opts:description"),
                descriptionLocalize: trA("opts:rename:opts:description"),
                type: 3,
                required: true
            }]
        }, {
            name: "limit",
            description: tr("opts:limit:description"),
            descriptionLocalize: trA("opts:limit:description"),
            type: 1,
            options: [{
                name: tr("opts:limit:opts:name"),
                description: tr("opts:limit:opts:description"),
                descriptionLocalize: trA("opts:limit:opts:description"),
                type: 10,
                required: true
            }]
        },{
            name: "hide",
            description: tr("opts:hide:description"),
            descriptionLocalize: trA("opts:hide:description"),
            type: 1
        },{
            name: "visible",
            description: tr("opts:visible:description"),
            descriptionLocalize: trA("opts:visible:description"),
            type: 1
        }, {
            name: "add_admin",
            description: tr("opts:add_admin:description"),
            descriptionLocalize: trA("opts:add_admin:description"),
            type: 1,
            options: [{
                name: tr("opts:add_admin:opts:name"),
                description: tr("opts:add_admin:opts:description"),
                descriptionLocalize: trA("opts:add_admin:opts:description"),
                type: 6,
                required: true
            }]
        }, {
            name: "remove_admin",
            description: tr("opts:remove_admin:description"),
            descriptionLocalize: trA("opts:remove_admin:description"),
            type: 1,
            options: [{
                name: tr("opts:remove_admin:opts:name"),
                description: tr("opts:remove_admin:opts:description"),
                descriptionLocalize: trA("opts:remove_admin:opts:description"),
                type: 6,
                required: true
            }]
        }, {
            name: "ban",
            description: tr("opts:ban:description"),
            descriptionLocalize: trA("opts:ban:description"),
            type: 1,
            options: [{
                name: tr("opts:ban:opts:name"),
                description: tr("opts:ban:opts:description"),
                descriptionLocalize: trA("opts:ban:opts:description"),
                type: 6,
                required: true
            }]
        }, {
            name: "unban",
            description: tr("opts:unban:description"),
            descriptionLocalize: trA("opts:unban:description"),
            type: 1,
            options: [{
                name: tr("opts:unban:opts:name"),
                description: tr("opts:unban:opts:description"),
                descriptionLocalize: trA("opts:unban:opts:description"),
                type: 6,
                required: true
            }]
        },{
            name: "mute",
            description: tr("opts:mute:description"),
            descriptionLocalize: trA("opts:mute:description"),
            type: 1
        }, {
            name: "unmute",
            description: tr("opts:ban:description"),
            
            descriptionLocalize: trA("opts:ban:description"),
            type: 1
        }]
    }
}