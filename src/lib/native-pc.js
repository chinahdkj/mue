const _getLocation = ({msgid, method, params}) => {
    window.response({msgid, method, params: null});
};

export const getLocation = _getLocation;