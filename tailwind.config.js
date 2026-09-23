export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      DEFAULT: '4px',
      bar: '3px',
    },
    extend: {
      colors: {
        base: '#101418',
        surface: '#161B1F',
        raised: '#1C2228',
        line: '#2A3138',
        primary: '#EDE6DC',
        muted: '#8E979F',
        accent: '#4A7DB0',
        done: '#3D8A7D',
        bronze: '#6E5A45',
        silver: '#9AA3AC',
        gold: '#C9A155',
        platinum: '#A9D9CE',
      },
      fontFamily: {
        sans: ['Work Sans'],
        display: ['Oswald'],
        body: ['Work Sans'],
      },
    },
  },
  plugins: [],
};
