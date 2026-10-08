import { useState, type FormEvent } from 'react';

const DRAWINGS = ['Hand sketches', 'PDF permit sets', 'Record drawings', 'Mechanical / HVAC', 'Parking levels', 'Something else'];
const ROLES = ['Architect', 'MEP / HVAC engineer', 'Contractor / estimator', 'Developer / owner', 'CAD drafting service', 'Other'];

const ENDPOINT = import.meta.env.VITE_EARLY_ACCESS_ENDPOINT as string | undefined;

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export function AccessForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ENDPOINT) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      firm: data.get('firm'),
      role: data.get('role'),
      drawings: data.getAll('drawings'),
    };
    setState({ kind: 'sending' });
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setState({ kind: 'sent' });
    } catch (err) {
      setState({ kind: 'error', message: `Could not send (${(err as Error).message}). Please try again.` });
    }
  }

  if (state.kind === 'sent') {
    return (
      <div className="form-done" role="status">
        <span className="stamp-ui">Received</span>
        <p>Thanks. We will be in touch about early access.</p>
      </div>
    );
  }

  return (
    <form className="access-form" onSubmit={submit}>
      {!ENDPOINT && (
        <p className="form-note">Submissions are off: this build has no form endpoint configured.</p>
      )}
      {/* Disabled as a whole when unconnected, so nobody fills in details that cannot be sent. */}
      <fieldset className="form-body" disabled={!ENDPOINT}>
        <div className="field-row">
          <label className="field">
            <span>Name</span>
            <input name="name" required autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>Firm</span>
            <input name="firm" required autoComplete="organization" />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="field chips">
          <legend>What drawings do you work with?</legend>
          {DRAWINGS.map((d) => (
            <label key={d} className="chip">
              <input type="checkbox" name="drawings" value={d} />
              <span>{d}</span>
            </label>
          ))}
        </fieldset>
        <button className="btn primary" type="submit" disabled={state.kind === 'sending'}>
          {state.kind === 'sending' ? 'Sending…' : 'Request early access'}
        </button>
      </fieldset>
      {state.kind === 'error' && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
