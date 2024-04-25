// @ts-ignore
/* eslint-disable */

declare namespace API {
    type CurrentUser = {
        user: {
            username?: string;
            avatar?: string;
            userid?: string;
            email?: string;
            signature?: string;
            title?: string;
            group?: string;
            tags?: { key?: string; label?: string }[];
            notifyCount?: number;
            unreadCount?: number;
            country?: string;
            access?: string;
            geographic?: {
                province?: { label?: string; key?: string };
                city?: { label?: string; key?: string };
            };
            address?: string;
            phone?: string;
        },
        permissions: [],
        roles: []
        menus: {
            /** @name 子菜单 */
            children?: MenuDataItem[];
            /** @name 在菜单中隐藏子节点 */
            hideChildrenInMenu?: boolean;
            /** @name 在菜单中隐藏自己和子节点 */
            hideInMenu?: boolean;
            /** @name 菜单的icon */
            icon?: React.ReactNode;
            /** @name 自定义菜单的国际化 key */
            locale?: string | false;
            /** @name 菜单的名字 */
            name?: string;
            /** @name 用于标定选中的值，默认是 path */
            key?: string;
            /** @name disable 菜单选项 */
            disabled?: boolean;
            /** @name 路径,可以设定为网页链接 */
            path?: string;
            /**
             * 当此节点被选中的时候也会选中 parentKeys 的节点
             *
             * @name 自定义父节点
             */
            parentKeys?: string[];
            /** @name 隐藏自己，并且将子节点提升到与自己平级 */
            flatMenu?: boolean;
            /** @name 指定外链打开形式，同a标签 */
            target?: string;
            /**
             * menuItem 的 tooltip 显示的路径
             */
            tooltip?: string;
            [key: string]: any;
        }[]
    };

    type LoginResult = {
        status?: string;
        type?: string;
        currentAuthority?: string;
    };

    type PageParams = {
        current?: number;
        pageSize?: number;
    };

    type RuleListItem = {
        key?: number;
        disabled?: boolean;
        href?: string;
        avatar?: string;
        name?: string;
        owner?: string;
        desc?: string;
        callNo?: number;
        status?: number;
        updatedAt?: string;
        createdAt?: string;
        progress?: number;
    };

    type RuleList = {
        data?: RuleListItem[];
        /** 列表的内容总数 */
        total?: number;
        success?: boolean;
    };

    type FakeCaptcha = {
        code?: number;
        status?: string;
    };

    type LoginParams = {
        username?: string;
        password?: string;
        autoLogin?: boolean;
        type?: string;
        grantType: 'password' | 'sms';
    };

    type ErrorResponse = {
        /** 业务约定的错误码 */
        errorCode: string;
        /** 业务上的错误信息 */
        errorMessage?: string;
        /** 业务上的请求是否成功 */
        success?: boolean;
    };

    type NoticeIconList = {
        data?: NoticeIconItem[];
        /** 列表的内容总数 */
        total?: number;
        success?: boolean;
    };

    type NoticeIconItemType = 'notification' | 'message' | 'event';

    type NoticeIconItem = {
        id?: string;
        extra?: string;
        key?: string;
        read?: boolean;
        avatar?: string;
        title?: string;
        status?: string;
        datetime?: string;
        description?: string;
        type?: NoticeIconItemType;
    };
}
