export const invalidDataRequest = (res) => {
    const data = {
        status: 500,
        statusText: 'FAIELD',
        subStatus: 500,
        subStatusText: '',
        message: 'INVALID_DATA',
    };
    return res.status(500).json(data);
};

export const success = (res, status) => (data) => {
    if (data) {
        data = {
            ...data,
            status: status || 200,
            statusText: 'SUCCESS',
            subStatus: 200,
            subStatusText: '',
            message: 'Get success',
        };
        res.status(status || 200).json(data);
    }
    return data;
};
export const successBackdoor = ({ bodyParams, queryParams, data, status, statusText }) => {
    return {
        ...bodyParams,
        ...queryParams,
        response: {
            status: status || 200,
            statusText: statusText || 'SUCCESS',
            message: 'Get success',
            ...data,
        },
    };
};

export const notFoundBackdoor = ({ bodyParams, queryParams, data, message, status, statusText }) => {
    return {
        ...bodyParams,
        ...queryParams,
        response: {
            status: status || 404,
            statusText: statusText || 'NOT_FOUND',
            message: message || "The data you're looking for was not found",
            ...data,
        },
    };
};
export const notFound = (res) => (entity) => {
    if (entity) {
        return entity;
    }
    res.status(404).end();
    return null;
};

export const authorOrAdmin = (res, user, userField) => (entity) => {
    if (entity) {
        const isAdmin = user.role === 'admin';
        const isAuthor = entity[userField] && entity[userField].equals(user.id);
        if (isAuthor || isAdmin) {
            return entity;
        }
        res.status(401).end();
    }
    return null;
};
