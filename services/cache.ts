
let _cache = { users: [] } // Todo: temp, fix later
export default {
    // async users() {
    //     if (!_cache.users.length) {
    //         _cache.users = await UsersService.all()
    //     }
    //     return _cache.users
    // },
    addUser(user) {
        const possible = _cache.users.find(u => u._id === user._id)
        if (possible) {
            const index = _cache.users.indexOf(possible)
            _cache.users.splice(index, 1, user)
        } else {
            _cache.users.push(user)
        }
    }
}