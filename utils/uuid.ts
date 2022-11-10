function shortUUID() {
    return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(-12)
}

export default {
    shortUUID,
}