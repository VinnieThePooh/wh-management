using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Warehouse.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class ResourceWithdrawal_And_Document : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WithdrawalDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Number = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WithdrawalDocuments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResourceWithdrawals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResourceId = table.Column<int>(type: "integer", nullable: false),
                    MeasureUnitId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    DocumentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceWithdrawals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResourceWithdrawals_MeasureUnits_MeasureUnitId",
                        column: x => x.MeasureUnitId,
                        principalTable: "MeasureUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResourceWithdrawals_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResourceWithdrawals_WithdrawalDocuments_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "WithdrawalDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResourceWithdrawals_DocumentId",
                table: "ResourceWithdrawals",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_ResourceWithdrawals_MeasureUnitId",
                table: "ResourceWithdrawals",
                column: "MeasureUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ResourceWithdrawals_ResourceId",
                table: "ResourceWithdrawals",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_WithdrawalDocuments_Number",
                table: "WithdrawalDocuments",
                column: "Number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResourceWithdrawals");

            migrationBuilder.DropTable(
                name: "WithdrawalDocuments");
        }
    }
}
