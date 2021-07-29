import React from 'react'
import { useIntl, Link, SelectLang } from 'umi';
import Footer from '@/components/Footer'
import styles from './index.less';

const Layout: React.FC = (props) => {

    const intl = useIntl();

    return (
        <div className={styles.container}>
            <div className={styles.lang} data-lang>
                {SelectLang && <SelectLang />}
            </div>
            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <Link to="/">
                            <img alt="logo" className={styles.logo} src="/logo.svg" />
                            <span className={styles.title}>Ant Design</span>
                        </Link>
                    </div>
                    <div className={styles.desc}>
                        {intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
                    </div>
                </div>

                {props.children}
            </div>
            <Footer />
        </div>
    )

}

export default Layout