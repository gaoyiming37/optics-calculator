import { C, E, KB } from './constants.js'

// ─── 共用图表点生成（噪声频谱） ───
function generateNoiseChartPoints(deltaF, steps, I, I_sig, T, R, M, F) {
  const fStart = deltaF / 100
  const fEnd = deltaF * 10
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const fi = fStart * Math.exp((i / steps) * Math.log(fEnd / fStart))
    const sh = M ? Math.sqrt(2 * E * I * M * M * F * fi) : Math.sqrt(2 * E * I * fi)
    const th = Math.sqrt(4 * KB * T * fi / R)
    const tot = Math.sqrt(sh * sh + th * th)
    const sig = I_sig || I
    pts.push({ freq: fi, shot: sh, thermal: th, total: tot, snr: sig / tot, snr_dB: 20 * Math.log10(sig / tot) })
  }
  return pts
}

// ─── 1.1 波长带宽 ↔ 频率带宽 ───
export function calcBandwidth(lambda0_nm, bandwidth, bwType) {
  const lambda0 = lambda0_nm * 1e-9 // nm→m
  const f0 = C / lambda0 // 中心频率 Hz

  let deltaLambda, deltaF
  if (bwType === 'wavelength') {
    deltaLambda = bandwidth * 1e-9
    deltaF = (C * deltaLambda) / (lambda0 * lambda0)
  } else {
    deltaF = bandwidth // Hz
    deltaLambda = (lambda0 * lambda0 * deltaF) / C
  }

  return {
    centerFreq_THz: f0 / 1e12,
    centerFreq_GHz: f0 / 1e9,
    deltaLambda_nm: deltaLambda * 1e9,
    deltaLambda_pm: deltaLambda * 1e12,
    deltaLambda_um: deltaLambda * 1e6,
    deltaF_Hz: deltaF,
    deltaF_GHz: deltaF / 1e9,
    deltaF_MHz: deltaF / 1e6,
    deltaF_THz: deltaF / 1e12,
  }
}

// ─── 1.2 功率换算 ───
export function calcPower(value, unit, impedance) {
  // 先统一转成 W
  let PW
  if (unit === 'W') PW = value
  else if (unit === 'mW') PW = value * 1e-3
  else if (unit === 'uW') PW = value * 1e-6
  else if (unit === 'dBm') PW = Math.pow(10, value / 10) * 1e-3 // dBm→W
  else PW = value // fallback

  const PmW = PW * 1e3
  const PdBm = 10 * Math.log10(PmW)
  const Vrms = Math.sqrt(PW * impedance)
  const Vpeak = Vrms * Math.SQRT2

  return {
    P_W: PW,
    P_mW: PmW,
    P_uW: PW * 1e6,
    P_dBm: isFinite(PdBm) ? PdBm : -Infinity,
    V_rms: Vrms,
    V_rms_mV: Vrms * 1e3,
    V_peak: Vpeak,
    V_peak_mV: Vpeak * 1e3,
  }
}

// ─── 2.1 高斯光束传播 ───
export function calcGaussianBeam(lambda_nm, waistDiameter_mm, dist_mm, M2) {
  if (M2 <= 0) M2 = 1
  const lam = lambda_nm * 1e-9 // m
  const w0 = (waistDiameter_mm / 2) * 1e-3 // 束腰半径 m
  const z = dist_mm * 1e-3 // m

  const zR = (Math.PI * w0 * w0) / (M2 * lam) // 瑞利长度 m
  const w_z = w0 * Math.sqrt(1 + (z / zR) ** 2) // 光束半径 m
  const theta = (M2 * lam) / (Math.PI * w0) // 发散半角 rad
  const R_z = z === 0 ? Infinity : z * (1 + (zR / z) ** 2) // 波前曲率 m

  // 用于图表的采样点
  const chartPoints = []
  const zMax = Math.max(z * 1.5, zR * 3)
  const steps = 100
  for (let i = 0; i <= steps; i++) {
    const zi = (zMax * i) / steps
    const wi = w0 * Math.sqrt(1 + (zi / zR) ** 2)
    chartPoints.push({ z: zi * 1e3, w: wi * 1e3 })
  }

  return {
    zR_mm: zR * 1e3,
    zR_cm: zR * 1e2,
    zR_m: zR,
    DOF_mm: 2 * zR * 1e3,
    theta_mrad: theta * 1e3,
    theta_deg: (theta * 180) / Math.PI,
    fullAngle_mrad: 2 * theta * 1e3,
    fullAngle_deg: (2 * theta * 180) / Math.PI,
    w_z_mm: w_z * 1e3,
    w_z_um: w_z * 1e6,
    D_z_mm: 2 * w_z * 1e3,
    R_z_m: R_z,
    R_z_mm: R_z === Infinity ? Infinity : R_z * 1e3,
    chartPoints,
  }
}

// ─── 2.2 透镜聚焦光斑 ───
export function calcLensFocus(lambda_nm, beamDiameter_mm, focalLength_mm, M2) {
  const lam = lambda_nm * 1e-9
  const win = (beamDiameter_mm / 2) * 1e-3
  const f = focalLength_mm * 1e-3

  const wf = (M2 * lam * f) / (Math.PI * win)
  const DOF = (2 * Math.PI * wf * wf) / (M2 * lam)
  const fNum = f / (2 * win)

  // 图表: wf vs f 曲线
  const chartPoints = []
  for (let i = 5; i <= 500; i += 2) {
    const fi = i * 1e-3
    const wi = (M2 * lam * fi) / (Math.PI * win)
    chartPoints.push({ f: i, wf: wi * 1e6 })
  }

  return {
    wf_um: wf * 1e6,
    wf_mm: wf * 1e3,
    Df_um: 2 * wf * 1e6,
    DOF_mm: DOF * 1e3,
    DOF_um: DOF * 1e6,
    fNum,
    chartPoints,
  }
}

// ─── 2.3 M² / BPP ───
export function calcBeamQuality(lambda_nm, waistRadius_um, divergence_mrad) {
  const lam = lambda_nm * 1e-9
  const w0 = waistRadius_um * 1e-6
  const theta = divergence_mrad * 1e-3

  const BPP = w0 * theta
  const M2 = (BPP * Math.PI) / lam

  return {
    BPP_mm_mrad: BPP * 1e6, // w0[m]*theta[rad] -> m*rad -> mm*mrad
    BPP_mm_deg: (BPP * 1e3 * 180) / Math.PI,
    M2,
  }
}

// ─── 2.4 功率/能量密度 ───
export function calcPowerDensity(mode, powerW, energyJ, pulseWidth_s, spotRadius_mm) {
  const r = spotRadius_mm * 1e-3
  const area = Math.PI * r * r

  let result = { area_mm2: area * 1e6, area_cm2: area * 1e4 }

  if (mode === 'CW') {
    result.intensity_Wcm2 = powerW / (area * 1e4) // W/m² → W/cm²
    result.intensity_kWcm2 = result.intensity_Wcm2 / 1e3
  } else {
    const peakPower = energyJ / pulseWidth_s
    result.peakPower_W = peakPower
    result.peakIntensity_Wcm2 = peakPower / (area * 1e4)
    result.peakIntensity_kWcm2 = result.peakIntensity_Wcm2 / 1e3
    result.fluence_Jcm2 = energyJ / (area * 1e4)
    result.fluence_mJcm2 = result.fluence_Jcm2 * 1e3
  }

  return result
}

// ─── 3.1 光栅衍射（空间分离） ───
export function calcGratingSeparation(lambda_nm, deltaLambda_nm, lineDensity, lineUnit, incidenceAngle_deg, order, distance_mm) {
  const lam = lambda_nm * 1e-9
  const dLam = deltaLambda_nm * 1e-9
  const L = distance_mm * 1e-3
  const theta_i = incidenceAngle_deg * Math.PI / 180

  // 统一刻线密度到 lines/m
  let N
  if (lineUnit === 'lines/mm') N = lineDensity * 1e3
  else if (lineUnit === 'lines/cm') N = lineDensity * 1e2
  else N = lineDensity // lines/m fallback
  if (N <= 0) return { error: '刻线密度必须大于 0' }
  const d = 1 / N

  // 衍射角
  const sinTheta_m = order * lam / d - Math.sin(theta_i)
  if (Math.abs(sinTheta_m) > 1) return { error: '衍射级次无效（超出光栅方程范围）' }
  const theta_m = Math.asin(sinTheta_m)

  // 角色散
  const dTheta_dLam = order / (d * Math.cos(theta_m))

  // 空间分离
  const deltaTheta = dTheta_dLam * dLam
  const deltaX = L * deltaTheta

  return {
    theta_m_deg: theta_m * 180 / Math.PI,
    theta_m_mrad: theta_m * 1e3,
    dTheta_dLam_mrad_nm: dTheta_dLam * 1e6, // rad/m → mrad/nm
    dTheta_dLam_deg_nm: dTheta_dLam * 180 / Math.PI * 1e9,
    deltaX_mm: deltaX * 1e3,
    deltaX_um: deltaX * 1e6,
    deltaX_cm: deltaX * 1e2,
  }
}

// ─── 3.2 光栅衍射角 ───
export function calcGratingAngle(lambda_nm, lineDensity, lineUnit, incidenceAngle_deg, order) {
  const lam = lambda_nm * 1e-9
  const theta_i = incidenceAngle_deg * Math.PI / 180

  let N
  if (lineUnit === 'lines/mm') N = lineDensity * 1e3
  else if (lineUnit === 'lines/cm') N = lineDensity * 1e2
  else N = lineDensity
  if (N <= 0) return { error: '刻线密度必须大于 0' }
  const d = 1 / N

  const sinTheta_m = order * lam / d - Math.sin(theta_i)
  if (Math.abs(sinTheta_m) > 1) return { error: '衍射级次无效' }
  const theta_m = Math.asin(sinTheta_m)

  const sinTheta_L = order * lam / (2 * d)
  let theta_L = null
  if (Math.abs(sinTheta_L) <= 1) {
    theta_L = Math.asin(sinTheta_L)
  }

  return {
    d_um: d * 1e6,
    d_nm: d * 1e9,
    theta_m_deg: theta_m * 180 / Math.PI,
    theta_m_mrad: theta_m * 1e3,
    theta_L_deg: theta_L !== null ? theta_L * 180 / Math.PI : null,
    theta_L_mrad: theta_L !== null ? theta_L * 1e3 : null,
  }
}

// ─── 4.1 响应度 / 探测率 ───
export function calcDetectorResponsivity(lambda_nm, quantumEff, area_mm2, NEP) {
  const lam = lambda_nm * 1e-3 // nm → μm
  const A = area_mm2 * 1e-6 // mm² → m²
  const R = quantumEff * lam / 1.24 // A/W
  const Dstar = Math.sqrt(A) / NEP // m·√Hz/W
  const Dstar_cgs = Dstar * 100 // m→cm

  return {
    R_AW: R,
    Dstar_cm_sqrtHz_W: Dstar_cgs,
  }
}

// ─── 4.1b 光电流计算 ───
export function calcPhotocurrent(R_AW, P_opt_W) {
  return { I_ph_A: R_AW * P_opt_W, I_ph_uA: R_AW * P_opt_W * 1e6 }
}

// ─── 4.2 噪声分析 ───
export function calcDetectorNoise(current_uA, bandwidth_Hz, load_Ohm, temp_K, darkCurrent_nA = 0) {
  const I = current_uA * 1e-6
  const I_dark = darkCurrent_nA * 1e-9
  const deltaF = bandwidth_Hz
  const R = load_Ohm <= 0 ? 1 : load_Ohm
  const T = temp_K

  const iShot = Math.sqrt(2 * E * (I + I_dark) * deltaF)
  const iThermal = Math.sqrt(4 * KB * T * deltaF / R)
  const iTotal = Math.sqrt(iShot ** 2 + iThermal ** 2)
  const SNR = I / iTotal
  const SNR_dB = 20 * Math.log10(SNR)

  const chartPoints = generateNoiseChartPoints(deltaF, 50, I + I_dark, I, T, R)

  return {
    iShot_A: iShot,
    iShot_nA: iShot * 1e9,
    iThermal_A: iThermal,
    iThermal_nA: iThermal * 1e9,
    iTotal_A: iTotal,
    iTotal_nA: iTotal * 1e9,
    SNR: SNR,
    SNR_dB: SNR_dB,
    chartPoints,
  }
}

// ─── 4.3 APD 噪声分析 ───
export function calcAPDNoise(params) {
  const { current_uA, bandwidth_Hz, load_Ohm, temp_K, M, k, darkCurrent_nA } = params
  const I = current_uA * 1e-6
  const I_dark = (darkCurrent_nA || 0) * 1e-9
  const deltaF = bandwidth_Hz
  const R = load_Ohm <= 0 ? 1 : load_Ohm
  const T = temp_K
  const Mk = M <= 1 ? 1 : M
  const F = k * Mk + (1 - k) * (2 - 1 / (Mk || 1))
  const I_sig = I * Mk
  const iShotAPD = Math.sqrt(2 * E * (I + I_dark) * Mk * Mk * F * deltaF)
  const iThermal = Math.sqrt(4 * KB * T * deltaF / R)
  const iTotal = Math.sqrt(iShotAPD ** 2 + iThermal ** 2)
  const SNR = I_sig / iTotal
  const SNR_dB = 20 * Math.log10(SNR)

  const chartPoints = generateNoiseChartPoints(deltaF, 50, I + I_dark, I_sig, T, R, Mk, F)

  return {
    F, I_sig_A: I_sig, I_sig_uA: I_sig * 1e6,
    iShot_A: iShotAPD, iShot_nA: iShotAPD * 1e9,
    iThermal_A: iThermal, iThermal_nA: iThermal * 1e9,
    iTotal_A: iTotal, iTotal_nA: iTotal * 1e9,
    SNR, SNR_dB, chartPoints,
  }
}

// ─── 5.1 传输延迟 ───
export function calcFiberDelay(length_km, n, roundTrip) {
  const L = length_km * 1e3
  const factor = roundTrip ? 2 : 1
  const OPL = factor * n * L
  const delay = factor * n * L / C

  return {
    OPL_m: OPL,
    OPL_km: OPL / 1e3,
    delay_s: delay,
    delay_ps: delay * 1e12,
    delay_ns: delay * 1e9,
    delay_us: delay * 1e6,
  }
}

// ─── 5.2 光纤衰减 ───
export function calcFiberAttenuation(alpha_dBkm, length_km, nodeCount, nodeLoss_dB) {
  const totalLoss = alpha_dBkm * length_km + nodeCount * nodeLoss_dB
  const transmittance = Math.pow(10, -totalLoss / 10)
  const n = 1.4682
  const delay = n * length_km * 1e3 / C

  return {
    totalLoss_dB: totalLoss,
    transmittance_pct: transmittance * 100,
    transmittance: transmittance,
    delay_us: delay * 1e6,
    delay_ns: delay * 1e9,
    delay_ps: delay * 1e12,
  }
}

// ─── 5.3 光纤耦合损耗 ───
export function calcCouplingLoss(MFD1_um, MFD2_um, offset_um) {
  const w1 = MFD1_um / 2
  const w2 = MFD2_um / 2
  const d = offset_um

  const modeMatch = (2 * w1 * w2) / (w1 ** 2 + w2 ** 2)
  const lateral = Math.exp(-2 * d ** 2 / (w1 ** 2 + w2 ** 2))
  const eta = (modeMatch ** 2) * lateral
  const loss = -10 * Math.log10(eta)

  return {
    eta: eta,
    eta_pct: eta * 100,
    loss_dB: loss,
  }
}

// ─── 6.1 光频梳 ───
export function calcOFC(frep_Hz, fceo_Hz, targetLambda_nm) {
  const targetLam = targetLambda_nm * 1e-9
  const fTarget = C / targetLam
  const n = Math.floor((fTarget - fceo_Hz) / frep_Hz)

  // 生成邻近 3 根梳齿 (n-1 ~ n+1)
  const teeth = []
  for (let i = -1; i <= 1; i++) {
    const ni = n + i
    const fni = ni * frep_Hz + fceo_Hz
    const lni = C / fni
    teeth.push({
      index: ni,
      freq_Hz: fni,
      freq_THz: fni / 1e12,
      lambda_nm: lni * 1e9,
    })
  }

  const fDownmix = frep_Hz * 4 - 980e6
  const fn = n * frep_Hz + fceo_Hz
  const lambda_n = C / fn

  return {
    frep_downmix_Hz: fDownmix,
    frep_downmix_MHz: fDownmix / 1e6,
    combIndex: n,
    combIndexScientific: n.toExponential(6),
    teeth,
    fn_THz: fn / 1e12,
    fn_GHz: fn / 1e9,
    fn_MHz: fn / 1e6,
    lambda_n_nm: lambda_n * 1e9,
    lambda_n_um: lambda_n * 1e6,
  }
}

// ─── 6.2 光频梳拍频 ───
export function calcOFCBeat(params) {
  const { f_CW_Hz, n, f_rep_Hz, f_CEO_Hz, f_beat_Hz, signCEO, signBeat } = params
  const s1 = signCEO || 1
  const s2 = signBeat || 1
  let r = { f_CW_Hz, n, f_rep_Hz, f_CEO_Hz, f_beat_Hz, signCEO: s1, signBeat: s2 }

  // 求解 f_CW: 需已知 n, f_rep, f_CEO, f_beat
  if (f_CW_Hz === null && n !== null && f_rep_Hz !== null && f_CEO_Hz !== null && f_beat_Hz !== null) {
    r.f_CW_Hz = n * f_rep_Hz + s1 * f_CEO_Hz + s2 * f_beat_Hz
    r._key = 'f_CW'
  }
  // 求解 n: 需已知 f_CW, f_rep, f_CEO, f_beat
  else if (n === null && f_CW_Hz !== null && f_rep_Hz !== null && f_CEO_Hz !== null && f_beat_Hz !== null) {
    r.n = (f_CW_Hz - s1 * f_CEO_Hz - s2 * f_beat_Hz) / f_rep_Hz
    r._key = 'n'
  }
  // 求解 f_rep: 需已知 f_CW, n, f_CEO, f_beat
  else if (f_rep_Hz === null && f_CW_Hz !== null && n !== null && f_CEO_Hz !== null && f_beat_Hz !== null) {
    r.f_rep_Hz = (f_CW_Hz - s1 * f_CEO_Hz - s2 * f_beat_Hz) / n
    r._key = 'f_rep'
  }
  // 求解 f_CEO: 需已知 f_CW, n, f_rep, f_beat
  else if (f_CEO_Hz === null && f_CW_Hz !== null && n !== null && f_rep_Hz !== null && f_beat_Hz !== null) {
    r.f_CEO_Hz = s1 * (f_CW_Hz - n * f_rep_Hz - s2 * f_beat_Hz)
    r._key = 'f_CEO'
  }
  // 求解 f_beat: 需已知 f_CW, n, f_rep, f_CEO
  else if (f_beat_Hz === null && f_CW_Hz !== null && n !== null && f_rep_Hz !== null && f_CEO_Hz !== null) {
    r.f_beat_Hz = (f_CW_Hz - n * f_rep_Hz - s1 * f_CEO_Hz) / s2
    r._key = 'f_beat'
  }

  if (r.f_CW_Hz !== null) {
    r.f_CW_THz = r.f_CW_Hz / 1e12
    r.f_CW_nm = (C / r.f_CW_Hz) * 1e9
  }
  if (r.n !== null) {
    r.n_int = Math.round(r.n)
  }
  return r
}

// ─── 6.3 光频梳近似推算 ───
export function calcOFCApprox(params) {
  const { f_CW_unsure_Hz, f_rep_Hz, f_CEO_Hz, f_beat_Hz, signCEO, signBeat } = params
  const s1 = signCEO || 1
  const s2 = signBeat || 1
  const n_approx = (f_CW_unsure_Hz - s1 * f_CEO_Hz - s2 * f_beat_Hz) / f_rep_Hz
  const n_rounded = Math.round(n_approx)
  const f_CW_precise = n_rounded * f_rep_Hz + s1 * f_CEO_Hz + s2 * f_beat_Hz
  return {
    n_approx, n_approx_2dec: n_approx.toFixed(2), n_rounded,
    f_CW_precise_Hz: f_CW_precise,
    f_CW_precise_THz: f_CW_precise / 1e12,
    f_CW_precise_nm: (C / f_CW_precise) * 1e9,
  }
}

// ─── 3.3 F-P 标准具 ───
export function calcEtalon(L_m, n, R, lambda_nm) {
  const FSR_f = C / (2 * n * L_m)
  const lam = lambda_nm * 1e-9
  const FSR_lam = lam * lam / (2 * n * L_m)
  const Finesse = R >= 1 ? Infinity : Math.PI * Math.sqrt(R) / (1 - R)
  const FWHM_f = Finesse === Infinity ? 0 : FSR_f / Finesse
  const FWHM_lam = Finesse === Infinity ? 0 : FSR_lam / Finesse
  return {
    FSR_f_Hz: FSR_f, FSR_f_GHz: FSR_f / 1e9, FSR_f_MHz: FSR_f / 1e6,
    FSR_lam_nm: FSR_lam * 1e9, FSR_lam_pm: FSR_lam * 1e12,
    Finesse, FWHM_f_Hz: FWHM_f, FWHM_f_MHz: FWHM_f / 1e6,
    FWHM_lam_nm: FWHM_lam * 1e9, FWHM_lam_pm: FWHM_lam * 1e12,
    Q: FWHM_lam === 0 ? Infinity : lambda_nm / (FWHM_lam * 1e9),
  }
}

// ─── 5.4 光纤色散 ───
export function calcFiberDispersion(lambda_nm, fiberType, lambda0_nm, S0) {
  const lam = lambda_nm
  const lam0 = lambda0_nm
  const D = (S0 / 4) * (lam - Math.pow(lam0, 4) / Math.pow(lam, 3))
  const beta2 = -(lam * lam) / (2 * Math.PI * C * 1e9) * D * 1e-3
  const S = S0 * (1 + Math.pow(lam0 / lam, 4)) / 2
  return { D_ps_nm_km: D, beta2_ps2_km: beta2, S_ps_nm2_km: S, lambda0_nm }
}
