module.exports = async (api) => {
    const DataTypes = api.db.DataTypes
    api.db.define('active_rooms', {
        channel: { type: DataTypes.STRING, allowNull: false },
        owner: { type: DataTypes.STRING, allowNull: false },
        guild: { type: DataTypes.STRING, allowNull: false }
    }, { freezeTableName: true, timestamps: false })

    // api.db.define('rooms', {
    //     owner: { type: DataTypes.STRING, allowNull: false },
    //     permissions: { type: DataTypes.STRING },
    //     videoQualityMode: { type: DataTypes.STRING },
    //     nsfw: { type: DataTypes.BOOLEAN },
    //     userLimit: { type: DataTypes.INTEGER },
    //     bitrate: { type: DataTypes.INTEGER }
    // }, { freezeTableName: true, timestamps: false })

    await api.db.sync();
    await api.db.createColumn("guild", "roomId", { type: DataTypes.STRING })
}