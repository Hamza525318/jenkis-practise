import express from 'express';
const app = express();
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/sum', (req, res) => {
  const a = Number(req.query.a || 0);
  const b = Number(req.query.b || 0);
  return res.json({ result: a + b });
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
export default app;
