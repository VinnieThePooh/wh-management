using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Warehouse.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class ResourceSupplement_And_Document : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupplyDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Number = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SupplyDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplyDocuments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResourceSupplements",
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
                    table.PrimaryKey("PK_ResourceSupplements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResourceSupplements_MeasureUnits_MeasureUnitId",
                        column: x => x.MeasureUnitId,
                        principalTable: "MeasureUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResourceSupplements_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResourceSupplements_SupplyDocuments_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "SupplyDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResourceSupplements_DocumentId",
                table: "ResourceSupplements",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_ResourceSupplements_MeasureUnitId",
                table: "ResourceSupplements",
                column: "MeasureUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ResourceSupplements_ResourceId",
                table: "ResourceSupplements",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplyDocuments_Number",
                table: "SupplyDocuments",
                column: "Number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResourceSupplements");

            migrationBuilder.DropTable(
                name: "SupplyDocuments");
        }
    }
}
