// pages/_app.js
import '../styles/globals.css'; // importa o CSS global do Tailwind

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
