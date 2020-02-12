const _getLocation = ({msgid, method, params}) => {
    window.response({msgid, method, params: {lat: 30, lng: 120}});
};

export const getLocation = _getLocation;