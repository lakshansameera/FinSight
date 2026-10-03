import { useRoute , type RouteProp } from '@react-navigation/native';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { RootStackParamList } from '@/navigation/types';

export default function BillDetailScreen() {
    const route = useRoute<RouteProp <RootStackParamList, 'BillDetail'>>();

    return <PlaceholderScreen title="Bill Detail" note={`Opened with billId = ${route.params.billId}`} />;
}