const _getLocation = ({msgid, method, params}) => {
    window.response({msgid, method, params: null});
};

export const getLocation = _getLocation;

const _rotate = ({msgid, method, params}) => {
    window.response({msgid, method, params: null});
};

export const rotate = _rotate;