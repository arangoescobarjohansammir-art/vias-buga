CREATE TYPE tipo_dano AS ENUM (
    'hueco', 
    'semaforo_danado', 
    'senalizacion', 
    'anden', 
    'sumidero'
);

CREATE TYPE estado_reporte AS ENUM (
    'recibido', 
    'en_revision', 
    'en_reparacion',
    'resuelto'
);

CREATE TABLE reportes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo tipo_dano NOT NULL,
    estado estado_reporte NOT NULL DEFAULT 'recibido',
    descripcion text NOT NULL CHECK (char_length(trim(descripcion)) > 0 AND char_length(descripcion) <= 500),
    latitud double precision NOT NULL CHECK (latitud BETWEEN -90 AND 90),
    longitud double precision NOT NULL CHECK (longitud BETWEEN -180 AND 180),
    creado_en timestamptz NOT NULL DEFAULT now()
);


DROP POLICY IF EXISTS "Permitir lectura pública de reportes" ON reportes;
DROP POLICY IF EXISTS "Permitir inserción a usuarios anónimos y autenticados" ON reportes;


CREATE POLICY "Permitir lectura pública de reportes" 
ON reportes 
FOR SELECT 
TO anon, authenticated 
USING (true);


CREATE POLICY "Permitir inserción a usuarios anónimos y autenticados" 
ON reportes 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (

    estado = 'recibido' 
    AND 

    creado_en = now()

);

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;