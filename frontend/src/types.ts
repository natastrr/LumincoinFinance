export type ErrorResponseType = {
    error: boolean,
    message: string,
    validation?: { key: string, message: string }[],
}

export type RequestParams = {
    method: string,
    headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'x-auth-token'?: string,
    },
    body?: string,
}

export type Balance = {
    balance: number
}

export type operationType = {
    id: number,
    type: string,
    amount: number,
    date: string,
    comment: string,
    category: string,
}

export type LoginResponseType = {
    tokens: {
        accessToken: string,
        refreshToken: string,
    },
    user: {
        name: string,
        lastName: string,
        id: number,
    }
}

export type SignupResponseType = {
    user: {
        id: number,
        email: string,
        name: string,
        lastName: string,
    }
}

export type createOrEditOperationType = {
        id: number,
        type: 'income' | 'expense',
        amount: number,
        date: `${number}-${number}-${number}`,
        "comment": string,
        "category": string,
}

export type createOrEditOperationRequestType = {
    type: string,
    amount: number,
    date: string,
    comment: string,
    category_id: number,
}

export type categoryType = {
    id: number,
    title: string,
}

export type EditInfoType = {
    id: number,
    type: string,
    sum: string;
    date: string;
    comment: string;
    category: string;
}

export type AccessTokenType = {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export type RouteType = {
    route: string,
    title: string,
    filePathTemplate: string,
    useSidebar?: string,
    authRequired?: boolean,
    load?: () => void,
}