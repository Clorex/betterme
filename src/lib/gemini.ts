async function postToApi(endpoint: string, body: any) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'AI request failed');
  }

  return data;
}

export async function chatWithCoach(message: string, context: any) {
  try {
    const data = await postToApi('/api/chat', { message, context });
    return data.reply;
  } catch (error) {
    console.error('Coach chat error:', error);
    return "I'm having a brief moment – let me get back to you! In the meantime, remember: consistency beats perfection. Keep going! 💪";
  }
}

export async function analyzeFood(photos: File[], note: string) {
  const formData = new FormData();
  photos.forEach((photo) => formData.append('photos', photo));
  formData.append('note', note);

  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Food analysis failed');
  }

  return data;
}

export async function generateMealPlan(userProfile: any) {
  const data = await postToApi('/api/meal-plan', { userProfile });
  return data;
}

export async function generateWorkout(userProfile: any) {
  const data = await postToApi('/api/workout', { userProfile });
  return data;
}