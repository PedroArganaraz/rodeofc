create policy "escudos rivales select" on storage.objects
  for select using (
    bucket_id = 'escudos-rivales'
  );