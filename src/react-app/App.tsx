// src/App.tsx

import { useActionState } from 'react';
import './App.css';

async function submitAttendance(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const loginId = formData.get('login_id') as string;
  const password = formData.get('password') as string;
  const attendances = formData.get('attendances') as string;

  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login_id: loginId,
        password: password,
        attendances: attendances,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Attendance submitted successfully' };
    }
    return { success: false, message: 'Failed to submit attendance' };
  } catch (error) {
    return { success: false, message: 'Network error occurred' };
  }
}

function App() {
  const [state, formAction, isPending] = useActionState(submitAttendance, null);

  return (
    <div className='min-h-screen bg-gray-50 py-4'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold text-center mb-6'>
          Attendance Input
        </h1>

        <form action={formAction} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='login_id'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Login ID
              </label>
              <input
                type='text'
                id='login_id'
                name='login_id'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='attendances'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Attendances (JSON)
            </label>
            <textarea
              id='attendances'
              name='attendances'
              rows={16}
              required
              placeholder='{"date": "2024-01-01", "start_time": "09:00", "end_time": "18:00", ...}'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
            />
          </div>

          <button
            type='submit'
            disabled={isPending}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {isPending ? 'Sending...' : 'Send'}
          </button>
        </form>

        {state && (
          <div
            className={`mt-4 p-3 rounded-md ${
              state.success
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {state.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
