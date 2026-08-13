import Svg, { Circle, Ellipse, G } from 'react-native-svg';

type Props = {
  boyut?: number;
  renk?: string;
};

/**
 * Gecici logo isareti (yorunge + uc nokta).
 *
 * ONEMLI: Bunu kurumun resmi logosuyla degistirin.
 *   1) Logo dosyasini assets/isdemir-logo.png olarak koyun
 *   2) Bu bileseni su satirla degistirin:
 *      <Image source={require('../assets/isdemir-logo.png')} style={{ width: 56, height: 34 }} resizeMode="contain" />
 */
export default function IsdemirLogo({ boyut = 56, renk = '#E11D25' }: Props) {
  return (
    <Svg width={boyut} height={boyut * 0.62} viewBox="0 0 100 62">
      <G transform="rotate(-16 50 31)">
        <Ellipse
          cx="50"
          cy="31"
          rx="45"
          ry="20"
          stroke={renk}
          strokeWidth={8}
          fill="none"
        />
      </G>
      <Circle cx="50" cy="17" r="5" fill={renk} />
      <Circle cx="50" cy="31" r="5" fill={renk} />
      <Circle cx="50" cy="45" r="5" fill={renk} />
    </Svg>
  );
}
