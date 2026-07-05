import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTablesQuery } from "../../../hooks/useTables";
import { useQueryClient } from "@tanstack/react-query";
import echo from "../../../lib/echo";
import CurrencyDisplay from "../../../components/CurrencyDisplay";
import { Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TableGridPage() {
	const { t } = useTranslation(["staff", "common"]);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Queries
	const { data: tables = [], isLoading, error } = useTablesQuery();

	// Real-time updates
	useEffect(() => {
		const channel = echo.channel("orders");
		const handleRefresh = () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
		};

		channel.listen(".App\\Events\\OrderCreated", handleRefresh);
		channel.listen(".App\\Events\\OrderUpdated", handleRefresh);

		return () => {
			echo.leaveChannel("orders");
		};
	}, [queryClient]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
				<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
				<p>{t("common:loading")}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 text-center text-destructive">
				<p className="mb-4">{t("common:error")}</p>
				<Button
					onClick={() =>
						queryClient.invalidateQueries({ queryKey: ["tables"] })
					}
					variant="outline"
					className="h-10 px-4 rounded-xl cursor-pointer"
				>
					{t("common:retry")}
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Title */}
			<div>
				<h1 className="text-xl font-black text-primary">
					{t("staff:tableManagement")}
				</h1>
				<p className="text-xs text-muted-foreground mt-1">
					{tables.filter((t) => t.status === "available").length}{" "}
					{t("common:available")} &bull;{" "}
					{tables.filter((t) => t.status === "occupied").length}{" "}
					{t("common:occupied")}
				</p>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
				{tables.map((table) => {
					// Status details
					const activeOrder = table.active_order;
					const isOccupied = table.status === "occupied";
					const isBilled = activeOrder?.status === "billed";

					let statusText = t("common:available");
					let badgeColorClass =
						"border-emerald-500/35 bg-emerald-500/5 text-emerald-400";

					if (isOccupied) {
						if (isBilled) {
							statusText = t("common:billed");
							badgeColorClass =
								"border-amber-500/35 bg-amber-500/5 text-amber-400";
						} else {
							statusText = t("common:occupied");
							badgeColorClass = ""; // uses destructive background
						}
					}

					// Calculate active items and total
					const itemsCount =
						activeOrder?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
					const itemsTotal =
						activeOrder?.items?.reduce(
							(acc, i) => acc + i.unit_price * i.quantity,
							0,
						) || 0;

					return (
						<button
							type="button"
							key={table.id}
							onClick={() => navigate(`/staff/tables/${table.id}`)}
							className={`glass flex flex-col justify-between text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] group cursor-pointer ${
								isOccupied
									? isBilled
										? "hover:border-amber-500/50 border-amber-500/20"
										: "hover:border-red-500/50 border-red-500/20"
									: "hover:border-emerald-500/50 border-emerald-500/20"
							}`}
						>
							{/* Header */}
							<div className="flex justify-between items-start w-full">
								<div>
									<h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
										{table.label || t('order:tableNumber', { number: table.number })}
									</h3>
									<div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
										<Users size={10} />
										<span>
											{table.capacity}{" "}
											{t("staff:seats", { defaultValue: "Seats" })}
										</span>
									</div>
								</div>

								<Badge
									variant={isOccupied && !isBilled ? "destructive" : "outline"}
									className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider h-auto ${badgeColorClass}`}
								>
									{statusText}
								</Badge>
							</div>

							{/* Order Info summary */}
							{isOccupied && activeOrder ? (
								<div className="mt-6 pt-2 border-t border-border space-y-1 w-full">
									<div className="flex items-center justify-between text-[10px] text-muted-foreground">
										<span className="flex items-center gap-1">
											<ClipboardList size={10} />
											{itemsCount} {t("staff:items", { defaultValue: "Items" })}
										</span>
										{activeOrder.note && (
											<span className="text-amber-400">* Note</span>
										)}
									</div>
									<div className="text-xs font-black text-foreground">
										<CurrencyDisplay amount={itemsTotal} />
									</div>
								</div>
							) : (
								<div className="mt-8 text-[10px] text-muted-foreground/60 italic">
									+ {t("staff:openOrder", { defaultValue: "Open Order" })}
								</div>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
