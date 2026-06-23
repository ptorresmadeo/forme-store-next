-- Seed: los 4 productos que hoy están hardcodeados en el frontend,
-- usando las mismas imágenes ya presentes en /public.
insert into productos (titulo, precio, descripcion, stock_por_talle, categoria, imagen_url) values
  (
    'Zip Hoodie Forme',
    89000,
    'Hoodie con cierre completo, friza premium y bordado Forme en el pecho.',
    '{"S": 8, "M": 12, "L": 6, "XL": 4}'::jsonb,
    'him',
    '/hoodie-him.jpg'
  ),
  (
    'Short Cuadrillé',
    65000,
    'Short de friza con paneles cuadrillé laterales, cintura elastizada con cordón.',
    '{"S": 10, "M": 10, "L": 5, "XL": 0}'::jsonb,
    'him',
    '/short-him.jpg'
  ),
  (
    'Zip Hoodie Forme',
    89000,
    'Hoodie con cierre completo, friza premium y bordado Forme en el pecho.',
    '{"XS": 6, "S": 9, "M": 7, "L": 3}'::jsonb,
    'her',
    '/campera-her.jpg'
  ),
  (
    'Short Cuadrillé',
    65000,
    'Short de friza con paneles cuadrillé laterales, cintura elastizada con cordón.',
    '{"XS": 5, "S": 8, "M": 6, "L": 4}'::jsonb,
    'her',
    '/short-her.jpg'
  );
