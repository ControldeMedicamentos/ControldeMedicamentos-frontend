module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      borderRadius: {
        modal: '10px'
      },
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bfd7f1',
          600: '#1d5f9f',
          700: '#164b7d'
        },
        surface: {
          50: '#f7f9fb',
          100: '#eef2f6',
          700: '#334155',
          900: '#0f172a'
        },
        border: '#d7dee8',
        text: '#1f2937',
        sidebar: {
          border: '#26354b'
        },
        overlay: 'rgba(0, 0, 0, 0.45)'
      },
      fontSize: {
        section: '0.62rem'
      },
      letterSpacing: {
        section: '0.08em'
      },
      maxWidth: {
        auth: '420px',
        detail: '280px',
        search: '380px',
        'med-name': '240px',
        motivo: '200px',
        dx: '180px',
        'dx-text': '160px',
        modal: '520px',
        'role-modal': '440px'
      },
      maxHeight: {
        modal: '90vh',
        preview: '80vh',
        suggestions: '220px'
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 2px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.12)',
        suggestion: '0 6px 18px rgba(0, 0, 0, 0.09)'
      },
      opacity: {
        55: '0.55',
        65: '0.65'
      },
      spacing: {
        2.75: '11px',
        4.5: '18px',
        5.5: '22px',
        7.5: '30px',
        8.5: '34px',
        13: '52px',
        chart: '130px'
      },
      gridTemplateColumns: {
        'detail-fields': 'repeat(auto-fill, minmax(200px, 1fr))',
        'patient-cards': 'repeat(auto-fill, minmax(280px, 1fr))',
        'inventory-layout': '360px 1fr',
        permissions: '1fr repeat(4, 80px)'
      },
      width: {
        sidebar: '248px'
      },
      height: {
        preview: '80vh'
      },
      minWidth: {
        'report-table': '1400px',
        'search-small': '200px'
      },
      minHeight: {
        panel: '400px'
      },
      zIndex: {
        100: '100',
        200: '200',
        modal: '1000'
      }
    }
  },
  plugins: []
};
