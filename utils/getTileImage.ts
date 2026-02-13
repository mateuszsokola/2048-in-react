import Tie2 from '@/assets/tiles/2.jpg'
import Tie4 from '@/assets/tiles/4.jpg'
import Tie8 from '@/assets/tiles/8.jpg'
import Tie16 from '@/assets/tiles/16.jpg'
import Tie32 from '@/assets/tiles/32.jpg'
import Tie64 from '@/assets/tiles/64.jpg'
import Tie128 from '@/assets/tiles/128.jpg'
import Tie256 from '@/assets/tiles/256.jpg'
import Tie512 from '@/assets/tiles/512.jpg'
import Tie1024 from '@/assets/tiles/1024.jpg'
import Tie2048 from '@/assets/tiles/2048.jpg'

export const getTileImage = (value: number) => {
    switch (value) {
        case 4:
            return Tie4;
        case 8:
            return Tie8;
        case 16:
            return Tie16;
        case 32:
            return Tie32;
        case 64:
            return Tie64;
        case 128:
            return Tie128;
        case 256:
            return Tie256;
        case 512:
            return Tie512;
        case 1024:
            return Tie1024;
        case 2048:
            return Tie2048;

        default:
            return Tie2;
    }
};