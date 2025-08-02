import React from 'react';

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#181818',
        color: '#fff',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        textAlign: 'center',
    },
    code: {
        fontSize: '8rem',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        color: '#ff5252',
        margin: 0,
    },
    message: {
        fontSize: '2rem',
        margin: '1rem 0',
    },
    homeLink: {
        marginTop: '2rem',
        padding: '0.75rem 2rem',
        background: '#ff5252',
        color: '#fff',
        border: 'none',
        borderRadius: '2rem',
        textDecoration: 'none',
        fontSize: '1rem',
        transition: 'background 0.2s',
        cursor: 'pointer',
    },
};

const Error404 = () => (
    <div style={styles.container}>
        <h1 style={styles.code}>404</h1>
        <div style={styles.message}>Oops! Page not found.</div>
        <a href="/" style={styles.homeLink}>
            Go Home
        </a>
    </div>
);

export default Error404;