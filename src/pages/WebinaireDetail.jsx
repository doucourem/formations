const WebinaireDetail = () => {
  return (
    <div>
      <h2>Webinaire : "Comment réussir sur Instagram"</h2>
      <p>Rejoignez-nous pour ce live exclusif animé par des experts du marketing digital.</p>

      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginTop: '1rem' }}>
        <iframe
          src="https://www.youtube.com/embed/ID_DU_LIVE"
          frameBorder="0"
          allowFullScreen
          title="Webinaire Live"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%'
          }}
        ></iframe>
      </div>
    </div>
  );
};
