-- 1. Função Matemática para Calcular Distância em Metros (Aproximação Esférica)
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    x float = 69.1 * (lat2 - lat1);
    y float = 69.1 * (lon2 - lon1) * cos(lat1 / 57.3);
BEGIN
    -- Retorna a distância em metros
    RETURN sqrt(x * x + y * y) * 1609.344;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Trigger para recalcular e impor o Geofence diretamente no Banco de Dados
CREATE OR REPLACE FUNCTION public.trg_enforce_geofence()
RETURNS TRIGGER AS $$
DECLARE
    v_settings RECORD;
    v_dist FLOAT;
BEGIN
    -- Busca as configurações de ponto do dono da empresa
    SELECT * INTO v_settings FROM public.time_clock_settings WHERE owner_id = NEW.account_owner_id;
    
    -- Se a empresa tiver coordenadas configuradas e o funcionário enviar as suas
    IF v_settings IS NOT NULL AND v_settings.office_latitude IS NOT NULL AND v_settings.office_longitude IS NOT NULL AND NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        -- O próprio servidor recalcula a distância (não confia no frontend)
        v_dist := public.calculate_distance(NEW.latitude, NEW.longitude, v_settings.office_latitude, v_settings.office_longitude);
        NEW.distance_meters := ROUND(v_dist);
        NEW.within_geofence := v_dist <= v_settings.allowed_radius_meters;
        
        -- Se a empresa exige geofence e o recálculo deu fora, bloqueia a inserção!
        IF v_settings.enforce_geofence AND NOT NEW.within_geofence THEN
            RAISE EXCEPTION 'SECURITY_REJECT: Ponto fora do local de trabalho. Distância real: %m', NEW.distance_meters;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_geofence_trigger ON public.time_clock_entries;
CREATE TRIGGER enforce_geofence_trigger
BEFORE INSERT ON public.time_clock_entries
FOR EACH ROW EXECUTE FUNCTION public.trg_enforce_geofence();

-- 3. Adicionar campo de status de verificação na tabela de colaboradores para o fluxo OTP
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT false;
