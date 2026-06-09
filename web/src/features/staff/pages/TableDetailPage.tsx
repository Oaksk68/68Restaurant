import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
	useTableQuery,
	useOpenTableOrderMutation,
} from "../../../hooks/useTables";
import { useMenuQuery } from "../../../hooks/useMenu";
import {
	useAddOrderItemsMutation,
	useUpdateOrderItemMutation,
	useDeleteOrderItemMutation,
	useBillOrderMutation,
} from "../../../hooks/useOrders";
import { useQueryClient } from "@tanstack/react-query";
import echo from "../../../lib/echo";
import CurrencyDisplay from "../../../components/CurrencyDisplay";
import {
	ChevronLeft,
	Plus,
	Minus,
	Trash2,
	Receipt,
	CreditCard,
	Sparkles,
	ChefHat,
	CheckCircle2,
	AlertCircle,
	ShoppingBag,
	X,
	Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetClose,
} from "@/components/ui/sheet";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TableDetailPage() {
	const { t, i18n } = useTranslation(["staff", "common", "menu", "order"]);
	const { tableId } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const numericTableId = Number(tableId);

	// Queries
	const {
		data: table,
		isLoading: tableLoading,
		error: tableError,
	} = useTableQuery(numericTableId);
	const { data: categories = [] } = useMenuQuery();

	// Mutations
	const openOrderMutation = useOpenTableOrderMutation();
	const addItemsMutation = useAddOrderItemsMutation();
	const updateItemMutation = useUpdateOrderItemMutation();
	const deleteItemMutation = useDeleteOrderItemMutation();
	const billOrderMutation = useBillOrderMutation();

	// State
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [localCart, setLocalCart] = useState<
		Record<
			number,
			{
				id: number;
				nameEn: string;
				nameMy: string;
				price: number;
				quantity: number;
				note: string;
			}
		>
	>({});
	const [itemToDelete, setItemToDelete] = useState<number | null>(null);

	// Echo Real-time sync for order updates
	useEffect(() => {
		if (!table?.active_order?.id) return;

		const channel = echo.channel(`orders.${table.active_order.id}`);
		const handleRefresh = () => {
			queryClient.invalidateQueries({ queryKey: ["tables", numericTableId] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
		};

		channel.listen(".App\\Events\\OrderUpdated", handleRefresh);
		channel.listen(".App\\Events\\OrderItemUpdated", handleRefresh);

		return () => {
			echo.leaveChannel(`orders.${table.active_order!.id}`);
		};
	}, [table?.active_order?.id, numericTableId, queryClient]);

	// Set default category when categories load
	useEffect(() => {
		if (categories.length > 0 && selectedCategory === null) {
			setSelectedCategory(categories[0].id);
		}
	}, [categories, selectedCategory]);

	if (tableLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
				<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
				<p>{t("common:loading")}</p>
			</div>
		);
	}

	if (tableError || !table) {
		return (
			<div className="p-8 text-center text-destructive">
				<p className="mb-4">{t("common:error")}</p>
				<Button
					onClick={() => navigate("/staff/tables")}
					variant="outline"
					className="h-10 px-4 rounded-xl cursor-pointer"
				>
					{t("common:back")}
				</Button>
			</div>
		);
	}

	const activeOrder = table.active_order;
	const isOccupied = table.status === "occupied" && activeOrder;

	// 1. Open order handler
	const handleOpenOrder = async () => {
		try {
			await openOrderMutation.mutateAsync(table.id);
			toast.success(t("common:success"));
			queryClient.invalidateQueries({ queryKey: ["tables", numericTableId] });
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// 2. Adjust item qty handler (directly on ordered items)
	const handleUpdateQty = async (
		itemId: number,
		currentQty: number,
		change: number,
	) => {
		if (!activeOrder) return;
		const newQty = currentQty + change;
		if (newQty <= 0) {
			handleDeleteItem(itemId);
			return;
		}

		try {
			await updateItemMutation.mutateAsync({
				orderId: activeOrder.id,
				itemId,
				data: { quantity: newQty },
			});
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// 3. Update order item status handler
	const handleUpdateItemStatus = async (
		itemId: number,
		nextStatus: "pending" | "preparing" | "served",
	) => {
		if (!activeOrder) return;
		try {
			await updateItemMutation.mutateAsync({
				orderId: activeOrder.id,
				itemId,
				data: { status: nextStatus },
			});
			toast.success(t("common:success"));
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// 4. Void/delete item handler
	const handleDeleteItem = (itemId: number) => {
		setItemToDelete(itemId);
	};

	const confirmDeleteItem = async () => {
		if (!activeOrder || itemToDelete === null) return;
		const itemId = itemToDelete;
		setItemToDelete(null);
		try {
			await deleteItemMutation.mutateAsync({
				orderId: activeOrder.id,
				itemId,
			});
			toast.success(t("common:success"));
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// 5. Lock bill handler
	const handleRequestBill = async () => {
		if (!activeOrder) return;
		try {
			await billOrderMutation.mutateAsync(activeOrder.id);
			toast.success(t("common:success"));
			navigate(`/staff/tables/${table.id}/billing`);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// 6. Local cart management for catalog
	const addToLocalCart = (item: any) => {
		setLocalCart((prev) => {
			const existing = prev[item.id];
			return {
				...prev,
				[item.id]: {
					id: item.id,
					nameEn: item.name_en,
					nameMy: item.name_my,
					price: item.price,
					quantity: existing ? existing.quantity + 1 : 1,
					note: existing?.note || "",
				},
			};
		});
	};

	const updateLocalCartQty = (itemId: number, qty: number) => {
		setLocalCart((prev) => {
			if (qty <= 0) {
				const copy = { ...prev };
				delete copy[itemId];
				return copy;
			}
			return {
				...prev,
				[itemId]: { ...prev[itemId], quantity: qty },
			};
		});
	};

	const updateLocalCartNote = (itemId: number, note: string) => {
		setLocalCart((prev) => ({
			...prev,
			[itemId]: { ...prev[itemId], note },
		}));
	};

	// Submit local cart items to API
	const handleAddItemsSubmit = async () => {
		if (!activeOrder) return;
		const cartList = Object.values(localCart);
		if (cartList.length === 0) return;

		try {
			const payload = cartList.map((i) => ({
				menu_item_id: i.id,
				quantity: i.quantity,
				note: i.note || undefined,
			}));
			await addItemsMutation.mutateAsync({
				orderId: activeOrder.id,
				items: payload,
			});
			toast.success(t("common:success"));
			setLocalCart({});
			setCatalogOpen(false);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || t("common:error"));
		}
	};

	// Filter menu items for catalog
	const activeCategoryData = categories.find((c) => c.id === selectedCategory);
	const filteredItems =
		activeCategoryData?.menu_items?.filter((item) => {
			const name = i18n.language === "my" ? item.name_my : item.name_en;
			return name.toLowerCase().includes(searchQuery.toLowerCase());
		}) || [];

	return (
		<div className="space-y-6">
			{/* Navigation */}
			<Button
				variant="ghost"
				onClick={() => navigate("/staff/tables")}
				className="flex items-center gap-1.5 text-xs text-primary hover:text-foreground hover:bg-transparent transition-colors p-0 h-auto cursor-pointer"
			>
				<ChevronLeft size={16} />
				{t("staff:tableManagement")}
			</Button>

			{/* Header Info */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-border">
				<div>
					<h1 className="text-xl font-black text-primary">
						{t("staff:tableDetail", { number: table.number })}
					</h1>
					<p className="text-xs text-muted-foreground mt-1">
						{t("staff:capacitySeats", {
							count: table.capacity,
							defaultValue: `Capacity: ${table.capacity} Seats`,
						})}{" "}
						&bull;{" "}
						{isOccupied
							? t("staff:itemsOrdered", {
									count: activeOrder.items?.length || 0,
									defaultValue: `${activeOrder.items?.length || 0} items ordered`,
								})
							: t("staff:noActiveOrder", { defaultValue: "No active order" })}
					</p>
				</div>

				{isOccupied && (
					<div className="flex items-center gap-2">
						{activeOrder.status === "open" ? (
							<Button
								onClick={handleRequestBill}
								className="flex items-center gap-1.5 px-4 h-10 bg-amber-600 hover:bg-amber-700 font-bold text-white text-xs rounded-xl cursor-pointer transition-all"
							>
								<Receipt size={14} />
								{t("staff:billTable")}
							</Button>
						) : (
							<Button
								onClick={() => navigate(`/staff/tables/${table.id}/payment`)}
								className="flex items-center gap-1.5 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl cursor-pointer transition-all"
							>
								<CreditCard size={14} />
								{t("staff:payNow")}
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Main Area */}
			{!isOccupied ? (
				// Available Screen
				<Card className="glass border-border rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 bg-card">
					<CardContent className="space-y-6 p-0">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/25">
							<Sparkles size={32} />
						</div>
						<div className="space-y-2">
							<h2 className="text-lg font-black text-foreground">
								{t("staff:tableAvailable")}
							</h2>
							<p className="text-xs text-muted-foreground">
								{t("staff:tableAvailableDesc", {
									defaultValue:
										"This table is currently clean and vacant. Tap open order to start a new dining session.",
								})}
							</p>
						</div>
						<Button
							onClick={handleOpenOrder}
							disabled={openOrderMutation.isPending}
							className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-sm font-black rounded-xl glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							{openOrderMutation.isPending ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<>
									<Plus size={16} />
									{t("order:newOrder")}
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			) : (
				// Occupied Screen - Item list
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
							{t("order:orderItems")}
						</h3>
						<Button
							variant="ghost"
							onClick={() => {
								setLocalCart({});
								setCatalogOpen(true);
							}}
							className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 font-bold cursor-pointer h-auto p-0 hover:bg-transparent"
						>
							<Plus size={14} />
							{t("staff:addItems")}
						</Button>
					</div>

					<div className="space-y-2.5">
						{activeOrder.items?.map((item) => {
							const name =
								i18n.language === "my"
									? item.menu_item.name_my
									: item.menu_item.name_en;
							return (
								<div
									key={item.id}
									className="glass p-4 border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
								>
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex items-center gap-2.5">
											<span className="text-xs font-black text-primary">
												x{item.quantity}
											</span>
											<h4 className="text-sm font-black text-foreground truncate">
												{name}
											</h4>
											{item.status === "pending" && (
												<Badge
													variant="outline"
													className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border-amber-500/25 h-auto"
												>
													{t("order:pending")}
												</Badge>
											)}
											{item.status === "preparing" && (
												<Badge
													variant="outline"
													className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border-blue-500/25 h-auto"
												>
													{t("order:preparing")}
												</Badge>
											)}
											{item.status === "served" && (
												<Badge
													variant="outline"
													className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border-emerald-500/25 h-auto"
												>
													{t("order:served")}
												</Badge>
											)}
										</div>
										{item.note && (
											<p className="text-[10px] text-amber-400 font-medium bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
												<AlertCircle size={10} />
												{item.note}
											</p>
										)}
									</div>

									<div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border pt-3.5 sm:pt-0">
										<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
											<span>
												{t("order:price", { defaultValue: "Price" })}:
											</span>
											<CurrencyDisplay
												amount={item.unit_price * item.quantity}
												className="font-bold text-foreground"
											/>
										</div>

										<div className="flex items-center gap-2">
											{/* Increase/decrease quantity (only for non-served items or if waiter overrides) */}
											{item.status !== "served" && (
												<div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleUpdateQty(item.id, item.quantity, -1)
														}
														className="w-6 h-6 rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer flex items-center justify-center"
													>
														<Minus size={10} />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															handleUpdateQty(item.id, item.quantity, 1)
														}
														className="w-6 h-6 rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer flex items-center justify-center"
													>
														<Plus size={10} />
													</Button>
												</div>
											)}

											{/* Status changes for waiter */}
											{item.status === "pending" && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleUpdateItemStatus(item.id, "preparing")
													}
													className="h-8 w-8 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 cursor-pointer flex items-center justify-center"
													title={t("order:markPreparing")}
												>
													<ChefHat size={14} />
												</Button>
											)}
											{item.status === "preparing" && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleUpdateItemStatus(item.id, "served")
													}
													className="h-8 w-8 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 cursor-pointer flex items-center justify-center"
													title={t("order:markServed")}
												>
													<CheckCircle2 size={14} />
												</Button>
											)}

											{/* Void item */}
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteItem(item.id)}
												className="h-8 w-8 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center"
												title={t("common:delete")}
											>
												<Trash2 size={14} />
											</Button>
										</div>
									</div>
								</div>
							);
						})}
						{(!activeOrder.items || activeOrder.items.length === 0) && (
							<div className="py-12 text-center text-muted-foreground text-sm">
								{t("staff:noItemsOrdered", {
									defaultValue: "No items ordered yet. Click Add Items above.",
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Catalog Drawer to Add Items */}
			<Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
				<SheetContent
					side="right"
					className="w-full max-w-lg p-0 flex flex-col h-full bg-card border-l border-border"
					showCloseButton={false}
				>
					{/* Header */}
					<SheetHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
						<SheetTitle className="text-base font-black text-foreground flex items-center gap-2">
							<ShoppingBag size={18} className="text-primary" />
							{t("staff:addItems")}
						</SheetTitle>
						<SheetClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="cursor-pointer h-8 w-8"
							>
								<X
									size={20}
									className="text-muted-foreground hover:text-foreground"
								/>
							</Button>
						</SheetClose>
					</SheetHeader>

					{/* Catalog Search & Category Tabs */}
					<div className="p-4 border-b border-border space-y-3 bg-card">
						<div className="relative">
							<Search
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t("menu:searchMenu")}
								className="w-full pl-9 pr-4 py-2 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
							/>
						</div>

						<div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
							{categories.map((cat) => {
								const isSelected = selectedCategory === cat.id;
								const catName =
									i18n.language === "my" ? cat.name_my : cat.name_en;
								return (
									<Button
										key={cat.id}
										variant={isSelected ? "default" : "outline"}
										onClick={() => {
											setSelectedCategory(cat.id);
											setSearchQuery("");
										}}
										className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all h-8 cursor-pointer ${
											isSelected
												? "bg-primary/20 text-primary border-primary/40"
												: "bg-background text-muted-foreground border-border"
										}`}
									>
										{catName}
									</Button>
								);
							})}
						</div>
					</div>

					{/* Catalog Items list */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3">
						{filteredItems.map((item) => {
							const name = i18n.language === "my" ? item.name_my : item.name_en;
							const inCart = localCart[item.id];

							return (
								<div
									key={item.id}
									className="p-3 bg-background border border-border rounded-xl flex justify-between items-center gap-4"
								>
									<div className="min-w-0">
										<h4 className="text-xs font-bold text-primary truncate">
											{name}
										</h4>
										<CurrencyDisplay
											amount={item.price}
											className="text-xs text-muted-foreground font-semibold"
										/>
									</div>

									{inCart ? (
										<div className="flex flex-col items-end gap-1.5">
											<div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-0.5">
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														updateLocalCartQty(item.id, inCart.quantity - 1)
													}
													className="w-6 h-6 rounded bg-muted text-foreground flex items-center justify-center text-xs cursor-pointer"
												>
													-
												</Button>
												<span className="text-xs font-black text-foreground w-4 text-center">
													{inCart.quantity}
												</span>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														updateLocalCartQty(item.id, inCart.quantity + 1)
													}
													className="w-6 h-6 rounded bg-muted text-foreground flex items-center justify-center text-xs cursor-pointer"
												>
													+
												</Button>
											</div>
											<Input
												type="text"
												value={inCart.note}
												onChange={(e) =>
													updateLocalCartNote(item.id, e.target.value)
												}
												placeholder="Note (spicy...)"
												className="w-28 text-[9px] h-6 px-1.5 py-0.5 bg-background border-border text-foreground rounded focus:outline-none"
											/>
										</div>
									) : (
										<Button
											onClick={() => addToLocalCart(item)}
											size="sm"
											className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-extrabold rounded-md flex items-center gap-1 cursor-pointer h-7"
										>
											<Plus size={10} />
											{t("common:add")}
										</Button>
									)}
								</div>
							);
						})}
					</div>

					{/* Catalog Footer */}
					<div className="p-4 border-t border-border bg-card space-y-4">
						<div className="flex justify-between items-center text-xs font-bold text-foreground">
							<span>
								{t("staff:selectedCount", {
									count: Object.values(localCart).reduce(
										(acc, i) => acc + i.quantity,
										0,
									),
									defaultValue: `Selected (${Object.values(localCart).reduce((acc, i) => acc + i.quantity, 0)}):`,
								})}
							</span>
							<CurrencyDisplay
								amount={Object.values(localCart).reduce(
									(acc, i) => acc + i.price * i.quantity,
									0,
								)}
								className="text-primary font-extrabold"
							/>
						</div>
						<Button
							onClick={handleAddItemsSubmit}
							disabled={
								addItemsMutation.isPending ||
								Object.keys(localCart).length === 0
							}
							className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl glow-brand transition-all flex items-center justify-center gap-1.5 cursor-pointer"
						>
							{addItemsMutation.isPending ? (
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<>
									<CheckCircle2 size={14} />
									{t("staff:submitItems", { defaultValue: "Submit Items" })}
								</>
							)}
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			<AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("common:confirm", { defaultValue: "Confirm Action" })}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("menu:confirmDelete")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("common:cancel", { defaultValue: "Cancel" })}</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={confirmDeleteItem}>
							{t("common:delete", { defaultValue: "Delete" })}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
